// src/services/notification/index.ts
import * as amqp from 'amqplib/callback_api';
import { EventEmitter } from 'events';
import db from '../../database';
import { NotificationPayload, NotificationStatus, NotificationType } from '../../models/notification.model';
import EmailService from './email.service';
import SmsService from './sms.service'; 
import { ISmsService } from '../../interfaces/ISmsService.ts'; 
import PushService from './push.service';
import InAppService from './in-app.service';

class NotificationService extends EventEmitter {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly queueName = 'notifications';
  private emailService: EmailService;
  private smsService: ISmsService;  // Change type to ISmsService for flexibility
  private pushService: PushService;
  private inAppService: InAppService;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(smsService: ISmsService = new SmsService()) {  // Allow injecting the smsService
    super();
    this.emailService = new EmailService();
    this.smsService = smsService; // Use the passed service or default to Termii
    this.pushService = new PushService();
    this.inAppService = new InAppService();
  }

  // Connect to RabbitMQ
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const amqpUrl = process.env.RABBITMQ_URL;
      if (!amqpUrl) {
        return reject(new Error('RABBITMQ_URL environment variable is not set'));
      }

      amqp.connect(amqpUrl, (err, connection) => {
        if (err) {
          console.error('Failed to connect to RabbitMQ:', err);
          this.reconnect();
          return reject(err);
        }

        this.connection = connection;
        connection.createChannel((err, channel) => {
          if (err) {
            console.error('Failed to create channel:', err);
            return reject(err);
          }

          this.channel = channel;
          channel.assertQueue(this.queueName, { durable: true }, (err) => {
            if (err) {
              console.error('Failed to assert queue:', err);
              return reject(err);
            }

            console.log('Connected to RabbitMQ');
            this.reconnectAttempts = 0;
            this.setupConnectionHandlers();
            this.startConsumer();
            resolve();
          });
        });
      });
    });
  }

  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    this.connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      this.reconnect();
    });

    this.connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
      this.reconnect();
    });
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Giving up.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(5000 * this.reconnectAttempts, 30000);

    console.log(`Attempting to reconnect to RabbitMQ (attempt ${this.reconnectAttempts}) in ${delay}ms...`);
    
    setTimeout(() => {
      this.connect().catch(err => {
        console.error('Reconnection attempt failed:', err);
      });
    }, delay);
  }

  private startConsumer(): void {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    this.channel.consume(this.queueName, async (msg: amqp.Message | null) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        await this.processNotification(content);
        this.channel?.ack(msg);
        console.log('[RabbitMQ Received Message]', msg.content.toString());
      } catch (error) {
        console.error('Error processing message:', error);
        this.channel?.nack(msg, false, !msg.fields.redelivered);
      }
    });
  }

  async queueNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      const result = await db.query(
        `INSERT INTO notifications (type, recipient, subject, content, metadata, status) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id`,
        [
          payload.type,
          payload.recipient,
          payload.subject || '',
          payload.content,
          payload.metadata || {},
          NotificationStatus.PENDING
        ]
      );

      const notificationId = result.rows[0].id;
      const message = { ...payload, id: notificationId };

      // Publish to queue
      this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      console.log(`Notification queued: ${notificationId}`);
      this.emit('notification:queued', message);
    } catch (error) {
      console.error('Failed to queue notification:', error);
      throw error;
    }
  }

  private async processNotification(notification: NotificationPayload & { id?: number }): Promise<void> {
    try {
      console.log(`Processing notification: ${notification.id}`);
      
      switch (notification.type) {
        case NotificationType.EMAIL:
          await this.emailService.send(notification);
          break;
        case NotificationType.SMS:
          await this.smsService.send(notification);
          console.log('Attempting to send SMS:', notification);
          await this.smsService.send(notification);
          break;
        case NotificationType.PUSH:
          await this.pushService.send(notification);
          break;
        case NotificationType.IN_APP:
          await this.inAppService.send(notification);
          break;
        default:
          throw new Error(`Unsupported notification type: ${notification.type}`);
      }

      if (notification.id) {
        await db.query(
          `UPDATE notifications SET status = $1, sent_at = NOW(), updated_at = NOW() WHERE id = $2`,
          [NotificationStatus.SENT, notification.id]
        );
      }

      this.emit('notification:sent', notification);
      
    } catch (error) {
      console.error(`Failed to process notification ${notification.id}:`, error);

      if (notification.id) {
        await db.query(
          `UPDATE notifications SET status = $1, updated_at = NOW() WHERE id = $2`,
          [NotificationStatus.FAILED, notification.id]
        );
      }

      this.emit('notification:failed', { notification, error });
      throw error;
    }
  }

  // Close connections
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.channel) {
        this.channel.close((err) => {
          if (err) {
            console.error('Error closing channel:', err);
            return reject(err);
          }
          console.log('Channel closed');
          this.closeConnection(resolve, reject);
        });
      } else {
        this.closeConnection(resolve, reject);
      }
    });
  }

  private closeConnection(resolve: () => void, reject: (err: any) => void): void {
    if (this.connection) {
      this.connection.close((err) => {
        if (err) {
          console.error('Error closing connection:', err);
          return reject(err);
        }
        console.log('Connection closed');
        resolve();
      });
    } else {
      resolve();
    }
  }
}

export default new NotificationService();
