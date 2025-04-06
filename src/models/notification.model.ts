
export enum NotificationType {
    EMAIL = 'email',
    SMS = 'sms',
    PUSH = 'push',
    IN_APP = 'in_app'
  }
  
  
  export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed'
  }
  

  export interface NotificationPayload {
    type: NotificationType;
    recipient: string;
    subject?: string;
    content: string;
    metadata?: Record<string, any>;
  }
  
  export interface Notification extends NotificationPayload {
    id?: number;
    status: NotificationStatus;
    createdAt: Date;
    updatedAt: Date;
    sentAt?: Date;
  }
  
  export interface InAppNotification {
    id?: number;
    userId: string;
    content: string;
    read: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
  }