
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
    if (error instanceof Error) {
      console.error('Error fetching notifications:', error.message, error.stack);
    } else {
      console.error('Error fetching notifications:', error);
    }
    res.status(500).json({ error: 'Failed to fetch notifications' });
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
    const err = error instanceof Error ? error.stack : error;
    console.error('Error creating sms notification:', err);
    res.status(500).json({ error: 'Failed to create notification', details: err });
  }
};

export const sendPushNotification: RequestHandler = async (req, res) => {
  try {
    const { recipient, content, metadata, subject } = req.body;
    
    if (!recipient || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    await notificationService.queueNotification({
      type: NotificationType.PUSH,
      recipient,
      subject: subject || 'New Notification',
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
    const { userId, content, metadata } = req.body;
    console.log('Creating in-app notification:', req.body);

    if (!userId || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

   const data = await notificationService.queueNotification({
      type: NotificationType.IN_APP,
      recipient: userId,
      content,
      metadata,
    });
    res.status(202).json({ message: 'In-app notification created' });
  } catch (error) {
    const err = error instanceof Error ? error.stack : error;
    console.error('Error creating in-app notification:', err);
    res.status(500).json({ error: 'Failed to create notification', details: err });
  }
};

export const getInAppNotifications: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { limit = 10, offset = 0, includeRead = 'false' } = req.query;

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
      Number(offset),
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


