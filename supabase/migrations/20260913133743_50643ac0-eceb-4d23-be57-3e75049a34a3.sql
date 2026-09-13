SELECT cron.unschedule('drain-email-queue')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'drain-email-queue');