DROP INDEX IF EXISTS idx_notifications_recipient;
DROP INDEX IF EXISTS idx_notifications_status;
DROP INDEX IF EXISTS idx_in_app_notifications_user_id;
DROP INDEX IF EXISTS idx_in_app_notifications_read;
DROP INDEX IF EXISTS idx_push_notifications_user_id;
DROP INDEX IF EXISTS idx_push_notifications_delivered;

DROP TABLE IF EXISTS push_notifications;
DROP TABLE IF EXISTS push_subscriptions;
DROP TABLE IF EXISTS in_app_notifications;
DROP TABLE IF EXISTS notifications;
