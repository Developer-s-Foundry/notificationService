/* Replace with your SQL commands */
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


CREATE INDEX idx_notifications_recipient ON notifications(recipient);
    CREATE INDEX idx_notifications_status ON notifications(status);
    CREATE INDEX idx_in_app_notifications_user_id ON in_app_notifications(user_id);
    CREATE INDEX idx_in_app_notifications_read ON in_app_notifications(read);