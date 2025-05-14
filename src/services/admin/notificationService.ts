import api from '../api';

interface Notification {
  id: number;
  user: { id: number; username: string };
  message: string;
  is_read: boolean;
  created_at: string;
}

const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notification/notifications/');
    return response.data;
  },
  createNotification: async (data: Partial<Notification>): Promise<Notification> => {
    const response = await api.post('/notifications/', data);
    return response.data;
  },
  markAsRead: async (id: number): Promise<void> => {
    await api.post(`/notification/alert/${id}/read/`);
  },
};

export default notificationService;