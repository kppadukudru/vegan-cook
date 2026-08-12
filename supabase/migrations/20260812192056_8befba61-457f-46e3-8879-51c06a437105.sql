ALTER TABLE public.email_send_log ADD COLUMN IF NOT EXISTS week text;

CREATE UNIQUE INDEX IF NOT EXISTS email_send_log_weekly_unique
  ON public.email_send_log (template_name, lower(recipient_email), week)
  WHERE week IS NOT NULL;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('send-weekly-issue') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-weekly-issue');
SELECT cron.unschedule('drain-email-queue') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'drain-email-queue');

SELECT cron.schedule(
  'send-weekly-issue',
  '0 8 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://project--922bdfe2-478b-4232-937c-4ffac3fc7e95.lovable.app/lovable/newsletter/send-weekly',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'drain-email-queue',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--922bdfe2-478b-4232-937c-4ffac3fc7e95.lovable.app/lovable/email/queue/process',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Lovable-Context', 'cron',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);