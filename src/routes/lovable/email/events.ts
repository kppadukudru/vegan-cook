import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'

const statusForEvent = {
  'email.bounced': 'bounced',
  'email.complaint': 'complained',
  'email.unsubscribed': 'suppressed',
} as const

const reasonForEvent = {
  'email.bounced': 'bounce',
  'email.complaint': 'complaint',
  'email.unsubscribed': 'unsubscribe',
} as const

const messageForEvent = {
  'email.bounced': 'Permanent bounce: email address is invalid or rejected',
  'email.complaint': 'Spam complaint: recipient marked email as spam',
  'email.unsubscribed': 'Recipient unsubscribed',
} as const

async function recordEvent(
  event: {
    event_id: string
    type: keyof typeof statusForEvent
    data: { recipient: string; message_id: string }
  },
) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const email = event.data.recipient.toLowerCase()
  const reason = reasonForEvent[event.type]

  const { error: suppressionError } = await supabaseAdmin
    .from('suppressed_emails')
    .upsert({ email, reason, metadata: null }, { onConflict: 'email' })
  if (suppressionError) {
    console.error('Failed to record email suppression', {
      code: suppressionError.code,
      message: suppressionError.message,
      event_id: event.event_id,
    })
    throw new Error('Failed to record email suppression')
  }

  const messageId = event.data.message_id
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('email_send_log')
    .select('id')
    .eq('message_id', messageId)
    .eq('status', statusForEvent[event.type])
    .maybeSingle()
  if (lookupError) {
    console.error('Failed to check email event log', {
      code: lookupError.code,
      message: lookupError.message,
      event_id: event.event_id,
    })
    throw new Error('Failed to check email event log')
  }
  if (existing) return

  const { error: logError } = await supabaseAdmin.from('email_send_log').insert({
    message_id: messageId,
    template_name: 'system',
    recipient_email: email,
    status: statusForEvent[event.type],
    error_message: messageForEvent[event.type],
    metadata: null,
  })
  if (logError) {
    console.error('Failed to record email event', {
      code: logError.code,
      message: logError.message,
      event_id: event.event_id,
    })
    throw new Error('Failed to record email event')
  }
}

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': async (event) => {
              await recordEvent(event)
            },
            'email.complaint': async (event) => {
              await recordEvent(event)
            },
            'email.unsubscribed': async (event) => {
              await recordEvent(event)
            },
          },
        })
        return handler(request)
      },
    },
  },
})
