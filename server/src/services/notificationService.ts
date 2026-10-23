import { Notification } from '../models/Notification.js';
import { env } from '../config/env.js';

interface NotificationPayload {
  user: string;
  complaint?: string;
  type: 'submission' | 'assignment' | 'status_update' | 'info_request' | 'resolution' | 'reopen';
  message: string;
}

export const createNotification = async (payload: NotificationPayload) => {
  const notification = await Notification.create(payload);
  return {
    notification,
    delivery: env.EMAIL_PROVIDER && env.EMAIL_API_KEY ? 'email-hook-configured' : 'in-app-only'
  };
};
