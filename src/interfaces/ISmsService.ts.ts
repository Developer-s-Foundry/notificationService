
import { NotificationPayload } from '../models/notification.model';

export interface ISmsService {
  send(notification: NotificationPayload): Promise<void>;
}
