import webpush from 'web-push';
import { NotificationPayload } from '../../models/notification.model';
import pool from '../../database/index'; 

// Set VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:emmyochogwu@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

class PushService {
  async send(notification: NotificationPayload): Promise<void> {
    try {
      // Get all push subscriptions for the recipient
      const { rows } = await pool.query(
        'SELECT subscription FROM push_subscriptions WHERE user_id = $1',
        [notification.recipient]
      );

      if (rows.length === 0) {
        console.warn(`[PUSH] No subscriptions found for user: ${notification.recipient}`);
        return;
      }

      // Send notification to each subscription
      const payload = JSON.stringify({
        title: notification.subject || 'New Notification',
        body: notification.content,
        metadata: notification.metadata,
      });

      for (const row of rows) {
        try {
          await webpush.sendNotification(row.subscription, payload);
          console.log(`[PUSH] Notification sent to user ${notification.recipient}`);
        } catch (err) {
          console.error(`[PUSH] Failed to send notification to user ${notification.recipient}:`, err);
        }
      }
    } catch (error) {
      console.error('[PUSH] Error querying push subscriptions:', error);
    }
  }
}

export default PushService;
