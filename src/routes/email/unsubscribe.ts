import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'

function redactEmail(email: string | null | undefined): string {
  if (!email) return '***'
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '***'
  return `${localPart[0]}***@${domain}`
}

export const Route = createFileRoute("/email/unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const supabaseUrl = import.meta.env['VITE_SUPABASE_URL']
        const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Extract token from query params
        const url = new URL(request.url)
        const token = url.searchParams.get('token')

        if (!token) {
          return Response.json({ error: 'Token is required' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Look up the token
        const { data: tokenRecord, error: lookupError } = await supabase
          .from('email_unsubscribe_tokens')
          .select('*')
          .eq('token', token)
          .maybeSingle()

        if (lookupError || !tokenRecord) {
          return Response.json({ error: 'Invalid or expired token' }, { status: 404 })
        }

        if (tokenRecord.used_at) {
          return Response.json({ valid: false, reason: 'already_unsubscribed' })
        }

        return Response.json({ valid: true })
      },

      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env['VITE_SUPABASE_URL']
        const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Extract token from query params (always present for RFC 8058 one-click)
        const url = new URL(request.url)
        let token: string | null = url.searchParams.get('token')

        // Detect RFC 8058 one-click unsubscribe: POST with form-encoded body
        // containing "List-Unsubscribe=One-Click". Email clients (Gmail, Apple Mail,
        // etc.) send this when the user clicks "Unsubscribe" in the mail UI.
        const contentType = request.headers.get('content-type') ?? ''
        if (contentType.includes('application/x-www-form-urlencoded')) {
          const formText = await request.text()
          const params = new URLSearchParams(formText)
          // For one-click, token comes from query param (already set above).
          // Otherwise, token may be in the form body.
          if (!params.get('List-Unsubscribe')) {
            const formToken = params.get('token')
            if (formToken) {
              token = formToken
            }
          }
        } else {
          // JSON body (from the app's unsubscribe page)
          try {
            const body = await request.json()
            if (body.token) {
              token = body.token
            } else if (typeof body.email === 'string' && body.email.includes('@')) {
              // No token (e.g. the reader landed on /unsubscribe directly).
              // Suppress the address itself, best-effort rate limited.
              const email = body.email.trim().toLowerCase()
              if (email.length > 200) {
                return Response.json({ error: 'Invalid email' }, { status: 400 })
              }
              const { checkRateLimit, clientIpFromHeaders } = await import(
                '@/lib/rate-limit.server'
              )
              const gate = checkRateLimit(
                'unsubscribe-by-email',
                clientIpFromHeaders(request.headers),
                10,
                60 * 60 * 1000,
              )
              if (!gate.allowed) {
                return Response.json({ error: 'Too many attempts' }, { status: 429 })
              }

              const supabaseByEmail = createClient(supabaseUrl, supabaseServiceKey)
              const { data: existing } = await supabaseByEmail
                .from('suppressed_emails')
                .select('id')
                .eq('email', email)
                .maybeSingle()
              if (existing) {
                return Response.json({ success: false, reason: 'already_unsubscribed' })
              }

              const { error: suppressErr } = await supabaseByEmail
                .from('suppressed_emails')
                .upsert({ email, reason: 'unsubscribe' }, { onConflict: 'email' })
              if (suppressErr) {
                console.error('Failed to suppress email by address', { error: suppressErr })
                return Response.json({ error: 'Failed to process unsubscribe' }, { status: 500 })
              }
              await supabaseByEmail
                .from('email_unsubscribe_tokens')
                .update({ used_at: new Date().toISOString() })
                .eq('email', email)
                .is('used_at', null)

              console.log('Email unsubscribed by address', {
                email_redacted: redactEmail(email),
              })
              return Response.json({ success: true })
            }
          } catch {
            // Fall through — token stays from query param
          }
        }

        if (!token) {
          return Response.json({ error: 'Token is required' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Look up the token
        const { data: tokenRecord, error: lookupError } = await supabase
          .from('email_unsubscribe_tokens')
          .select('*')
          .eq('token', token)
          .maybeSingle()

        if (lookupError || !tokenRecord) {
          return Response.json({ error: 'Invalid or expired token' }, { status: 404 })
        }

        if (tokenRecord.used_at) {
          return Response.json({ success: false, reason: 'already_unsubscribed' })
        }

        // Atomic check-and-update to avoid TOCTOU race
        const { data: updated, error: updateError } = await supabase
          .from('email_unsubscribe_tokens')
          .update({ used_at: new Date().toISOString() })
          .eq('token', token)
          .is('used_at', null)
          .select()
          .maybeSingle()

        if (updateError) {
          console.error('Failed to mark token as used', { error: updateError, token })
          return Response.json({ error: 'Failed to process unsubscribe' }, { status: 500 })
        }

        if (!updated) {
          return Response.json({ success: false, reason: 'already_unsubscribed' })
        }

        // Add email to suppressed list (upsert to handle duplicates)
        const { error: suppressError } = await supabase
          .from('suppressed_emails')
          .upsert(
            { email: tokenRecord.email.toLowerCase(), reason: 'unsubscribe' },
            { onConflict: 'email' },
          )

        if (suppressError) {
          console.error('Failed to suppress email', {
            error: suppressError,
            email_redacted: redactEmail(tokenRecord.email),
          })
          return Response.json({ error: 'Failed to process unsubscribe' }, { status: 500 })
        }

        console.log('Email unsubscribed', {
          email_redacted: redactEmail(tokenRecord.email),
        })

        return Response.json({ success: true })
      },
    },
  },
})
