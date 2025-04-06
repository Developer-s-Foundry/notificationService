
import { RequestHandler } from 'express';
import notificationService from '../services/notification';
import { NotificationType } from '../models/notification.model';
import db from '../database';

export const sendEmailNotification: RequestHandler = async (req, res) => {
  try {
    const { recipient, subject, content, metadata } = req.body;
    
    if (!recipient || !subject || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    await notificationService.queueNotification({
      type: NotificationType.EMAIL,
      recipient,
      subject,
      content,
      metadata
    });
    
    res.status(202).json({ message: 'Email notification queued' });
  } catch (error) {
    console.error('Failed to queue email notification:', error);
    res.status(500).json({ error: 'Failed to queue notification' });
  }
};

export const sendSmsNotification: RequestHandler = async (req, res) => {
  try {
    const { recipient, content, metadata } = req.body;
    
    if (!recipient || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    await notificationService.queueNotification({
      type: NotificationType.SMS,
      recipient,
      content,
      metadata
    });
    
    res.status(202).json({ message: 'SMS notification queued' });
  } catch (error) {
    console.error('Failed to queue SMS notification:', error);
    res.status(500).json({ error: 'Failed to queue notification' });
  }
};

export const sendPushNotification: RequestHandler = async (req, res) => {
  try {
    const { recipient, content, metadata } = req.body;
    
    if (!recipient || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    await notificationService.queueNotification({
      type: NotificationType.PUSH,
      recipient,
      content,
      metadata
    });
    
    res.status(202).json({ message: 'Push notification queued' });
  } catch (error) {
    console.error('Failed to queue push notification:', error);
    res.status(500).json({ error: 'Failed to queue notification' });
  }
};

export const createInAppNotification: RequestHandler = async (req, res) => {
  try {
    const { recipient, content, metadata } = req.body;
    
    if (!recipient || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    await notificationService.queueNotification({
      type: NotificationType.IN_APP,
      recipient,
      content,
      metadata
    });
    
    res.status(202).json({ message: 'In-app notification created' });
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

export const getInAppNotifications: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { limit = 10, offset = 0, includeRead = false } = req.query;
    
    const query = `
      SELECT * FROM in_app_notifications 
      WHERE user_id = $1 
      ${includeRead === 'true' ? '' : 'AND read = false'} 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [
      userId, 
      Number(limit), 
      Number(offset)
    ]);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch in-app notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markInAppNotificationAsRead: RequestHandler = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    await db.query(
      'UPDATE in_app_notifications SET read = true WHERE id = $1',
      [notificationId]
    );
    
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};