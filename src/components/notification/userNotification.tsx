import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import notificationService from '@/services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getUserNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(notification => !notification.is_read)
        .map(notification => notification.id);
      
      if (unreadIds.length === 0) return;
      
      // Create a sequence of promises to mark each notification as read
      for (const id of unreadIds) {
        await notificationService.markAsRead(id);
      }
      
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 border-none"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 z-50"
          >
            <Card className="border shadow-lg">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base flex justify-between items-center">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <p>No notifications</p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {notifications.map((notification) => (
                      <motion.li
                        key={notification.id}
                        initial={{ backgroundColor: notification.is_read ? "transparent" : "rgba(59, 130, 246, 0.1)" }}
                        animate={{ backgroundColor: notification.is_read ? "transparent" : "rgba(59, 130, 246, 0.1)" }}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 relative"
                      >
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <p className={`mb-1 ${!notification.is_read ? "font-medium" : ""}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-blue-600"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                Mark read
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}