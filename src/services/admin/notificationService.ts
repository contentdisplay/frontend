import api from '../api';

interface User {
  id: number;
  username: string;
}

interface Notification {
  id: number;
  user: User;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface CreateNotificationData {
  user_id?: number;
  message: string;
}

const notificationService = {
  // For regular users to get their notifications
  getUserNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notification/alert/');
    return response.data;
  },

  // For admins to get all notifications
  getAllNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notification/admin/notifications/');
    return response.data;
  },

  // For admins to create notifications (for individual users or broadcast)
  createNotification: async (data: CreateNotificationData): Promise<Notification | { message: string }> => {
    const response = await api.post('/notification/admin/notifications/create/', data);
    return response.data;
  },

  // For admins to update existing notifications
  updateNotification: async (id: number, data: { message: string }): Promise<Notification> => {
    const response = await api.put(`/notification/admin/notifications/${id}/update/`, data);
    return response.data;
  },

  // For admins to delete notifications
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notification/admin/notifications/${id}/delete/`);
  },

  // For users or admins to mark notifications as read
  markAsRead: async (id: number): Promise<void> => {
    await api.post(`/notification/alert/${id}/read/`);
  },
};

export default notificationService;