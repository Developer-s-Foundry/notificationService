
import express, { Request, Response} from 'express';
import { RequestHandler } from 'express';
import db from '../database';
import * as notificationController from '../controllers/notification.controller';

const router = express.Router();

router.post('/email', notificationController.sendEmailNotification);


router.post('/sms', notificationController.sendSmsNotification);


router.post('/push', notificationController.sendPushNotification);


router.post('/in-app', notificationController.createInAppNotification);
router.get('/in-app/:userId', notificationController.getInAppNotifications);
router.put('/in-app/:id/read', notificationController.markInAppNotificationAsRead);

// 🔔 New route for saving push subscription
const savePushSubscription: RequestHandler = async (req, res) => {
    let { userId, subscription } = req.body;
  
    if (!userId || !subscription) {
      res.status(400).json({ error: 'Missing userId or subscription' });
      return;
    }
    if (typeof subscription === 'string') {
        try {
          subscription = JSON.parse(subscription);
        } catch (err) {
          res.status(400).json({ error: 'Invalid subscription format' });
        }
      }
    
  
    try {
      await db.query(
        `
        INSERT INTO push_subscriptions (user_id, subscription)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET subscription = $2
      `,
        [userId, subscription]
      );
  
      res.status(200).json({ message: 'Push subscription saved' });
    } catch (error) {
      console.error('Failed to save push subscription:', error);
      res.status(500).json({ error: 'Failed to save subscription' });
    }
};

  router.post('/push/subscribe', savePushSubscription);
  

export default router;