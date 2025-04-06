
import express from 'express';
import * as notificationController from '../controllers/notification.controller';

const router = express.Router();

router.post('/email', notificationController.sendEmailNotification);


router.post('/sms', notificationController.sendSmsNotification);


router.post('/push', notificationController.sendPushNotification);


router.post('/in-app', notificationController.createInAppNotification);
router.get('/in-app/:userId', notificationController.getInAppNotifications);
router.put('/in-app/:id/read', notificationController.markInAppNotificationAsRead);

export default router;