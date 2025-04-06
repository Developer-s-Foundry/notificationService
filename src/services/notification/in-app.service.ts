
import db from '../../database';
import { NotificationPayload } from '../../models/notification.model';

class InAppService {
  async send(notification: NotificationPayload): Promise<void> {
    await db.query(
      `INSERT INTO in_app_notifications (user_id, content, read, metadata)
       VALUES ($1, $2, $3, $4)`,
      [notification.recipient, notification.content, false, notification.metadata || {}]
    );
  }

  async getNotificationsForUser(userId: string, limit: number, offset: number, includeRead: boolean): Promise<any[]> {
    const query = `
      SELECT * FROM in_app_notifications 
      WHERE user_id = $1 
      ${includeRead ? '' : 'AND read = false'} 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [userId, limit, offset]);
    return result.rows;
  }

  async markAsRead(notificationId: number): Promise<void> {
    await db.query(
      'UPDATE in_app_notifications SET read = true WHERE id = $1',
      [notificationId]
    );
  }
}

export default InAppService;