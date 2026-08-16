SELECT net.http_post(
  url := 'https://project--922bdfe2-478b-4232-937c-4ffac3fc7e95.lovable.app/lovable/newsletter/send-weekly',
  headers := jsonb_build_object('Content-Type','application/json','Lovable-Context','cron','Authorization','Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='email_queue_service_role_key')),
  body := '{}'::jsonb
) as request_id;