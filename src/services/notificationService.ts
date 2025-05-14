import api from './api';

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

const notificationService = {
  // Get all notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notification/alert/');
    return response.data.results || [];
  },

  // Mark a notification as read
  markAsRead: async (notificationId: number): Promise<{ message: string }> => {
    const response = await api.post(`/notification/alert/${notificationId}/read/`);
    return response.data;
  }
};

export default notificationService;