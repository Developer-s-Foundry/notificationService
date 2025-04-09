// src/services/notification/sms.service.ts

// import axios from 'axios';
// import { NotificationPayload } from '../../models/notification.model';
// import { ISmsService } from '../../interfaces/ISmsService.ts';

// class SmsService implements ISmsService {
//   private apiKey: string;
//   private sender: string;

//   constructor() {
//     this.apiKey = process.env.TERMII_API_KEY || '';
//     this.sender = process.env.TERMII_SENDER_ID || 'devfoundry'; // fallback
//     console.log('[Termii Config]', this.apiKey, this.sender);
//     if (!this.apiKey) {
//       throw new Error('TERMII_API_KEY is not set');
//     }
//   }

//   async send(notification: NotificationPayload): Promise<void> {
//     const { recipient, content } = notification;

//     try {
//         const response = await axios.post(
//           'https://api.ng.termii.com/api/sms/send',
//           {
//             to: recipient,
//             from: this.sender,
//             sms: content,
//             type: 'plain', 
//             channel: 'dnd',
//             api_key: this.apiKey,
//           },        
//           {
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           }
//         );
//         console.log('SMS Payload:', {
//           to: recipient,
//           from: this.sender,
//           sms: content,
//           api_key: this.apiKey,
//         });
//         console.log('SMS Response:', response.data);
        
//     } catch (error: any) {
//       console.error('[Termii SMS Error]', error?.response?.data || error.message);
//       throw new Error('Failed to send SMS via Termii');
//     }
//   }
// }


import axios from 'axios';
import twilio from 'twilio';
import { NotificationPayload } from '../../models/notification.model';
import { ISmsService } from '../../interfaces/ISmsService.ts';

const provider = process.env.SMS_PROVIDER || 'termii';

// --- Termii Implementation ---
class TermiiSmsService implements ISmsService {
  private apiKey: string;
  private sender: string;

  constructor() {
    this.apiKey = process.env.TERMII_API_KEY || '';
    this.sender = process.env.TERMII_SENDER_ID || 'devfoundry';
    if (!this.apiKey) throw new Error('TERMII_API_KEY is not set');
  }

  async send(notification: NotificationPayload): Promise<void> {
    const { recipient, content } = notification;

    const payload = {
      to: recipient,
      from: this.sender,
      sms: content,
      type: 'plain',
      channel: 'dnd',
      api_key: this.apiKey,
    };

    try {
      const response = await axios.post('https://api.ng.termii.com/api/sms/send', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[Termii SMS Sent]', response.data);
    } catch (error: any) {
      console.error('[Termii SMS Error]', error?.response?.data || error.message);
      throw new Error('Failed to send SMS via Termii');
    }
  }
}

// --- Twilio Implementation ---
class TwilioSmsService implements ISmsService {
  private client: twilio.Twilio;
  private from: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.from = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken || !this.from) {
      throw new Error('Twilio config not set properly');
    }

    this.client = twilio(accountSid, authToken);
  }

  async send(notification: NotificationPayload): Promise<void> {
    const { recipient, content } = notification;

    try {
      const message = await this.client.messages.create({
        body: content,
        from: this.from,
        to: recipient,
      });

      console.log('[Twilio SMS Sent]', message.sid);
    } catch (error: any) {
      console.error('[Twilio SMS Error]', error?.message || error);
      throw new Error('Failed to send SMS via Twilio');
    }
  }
}

// --- Service Selector ---
class SmsService {
  private service: ISmsService;

  constructor() {
    if (provider === 'twilio') {
      this.service = new TwilioSmsService();
    } else {
      this.service = new TermiiSmsService();
    }
  }

  async send(notification: NotificationPayload): Promise<void> {
    await this.service.send(notification);
  }
}

export default SmsService;

