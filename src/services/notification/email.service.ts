
import nodemailer from 'nodemailer';
import { NotificationPayload } from '../../models/notification.model';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(notification: NotificationPayload): Promise<void> {
    if (!notification.subject) {
      throw new Error('Email notification requires a subject');
    }
    
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: notification.recipient,
      subject: notification.subject,
      html: notification.content
    });
  }
}

export default EmailService;