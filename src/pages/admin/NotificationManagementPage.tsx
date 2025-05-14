import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import notificationService from '@/services/notificationService';
import { motion } from 'framer-motion';

interface Notification {
  id: number;
  user: { username: string };
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationManagementPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({ user_id: '', message: '' });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    }
  };

  const handleCreateNotification = async () => {
    try {
      await notificationService.createNotification({
        user: parseInt(newNotification.user_id),
        message: newNotification.message,
      });
      toast.success('Notification created successfully');
      setIsDialogOpen(false);
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to create notification');
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      toast.success('Notification marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          Notification Management
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-500">Create Notification</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="User ID"
                value={newNotification.user_id}
                onChange={(e) => setNewNotification({ ...newNotification, user_id: e.target.value })}
              />
              <Input
                placeholder="Message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              />
              <Button onClick={handleCreateNotification} className="w-full bg-gradient-to-r from-blue-600 to-indigo-500">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.user.username}</TableCell>
                    <TableCell>{notification.message}</TableCell>
                    <TableCell>{notification.is_read ? 'Read' : 'Unread'}</TableCell>
                    <TableCell>
                      {!notification.is_read && (
                        <Button onClick={() => handleMarkAsRead(notification.id)}>
                          Mark as Read
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}