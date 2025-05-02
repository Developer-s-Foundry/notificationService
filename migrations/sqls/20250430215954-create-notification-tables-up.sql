CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS in_app_notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  user_id VARCHAR(255) PRIMARY KEY,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS push_notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_notifications_recipient') THEN
    CREATE INDEX idx_notifications_recipient ON notifications(recipient);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_notifications_status') THEN
    CREATE INDEX idx_notifications_status ON notifications(status);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_in_app_notifications_user_id') THEN
    CREATE INDEX idx_in_app_notifications_user_id ON in_app_notifications(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_in_app_notifications_read') THEN
    CREATE INDEX idx_in_app_notifications_read ON in_app_notifications(read);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_push_notifications_user_id') THEN
    CREATE INDEX idx_push_notifications_user_id ON push_notifications(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_push_notifications_delivered') THEN
    CREATE INDEX idx_push_notifications_delivered ON push_notifications(delivered);
  END IF;
END$$;
