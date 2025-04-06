// src/services/notification/sms.service.ts
import nodemailer from 'nodemailer';
import { NotificationPayload } from '../../models/notification.model';

class SmsService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    // Initialize nodemailer transporter for SMS gateway
    // Many carriers offer email-to-SMS gateways
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(notification: NotificationPayload): Promise<void> {
    const { recipient, content } = notification;
    
    // Check if the recipient includes carrier information
    // Format expected: phoneNumber@carrier.gateway
    // Example: 1234567890@txt.att.net for AT&T
    if (!recipient.includes('@')) {
      console.log(`[SMS] To: ${recipient}, Message: ${content}`);
      console.log('Free SMS service requires carrier gateway format: number@carrier.gateway');
      return;
    }
    
    // Send SMS via email gateway
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      text: content // SMS should be plain text
    });
  }
}

export default SmsService;