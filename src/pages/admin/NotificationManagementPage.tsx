import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import notificationService from '@/services/notificationService';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

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

export default function NotificationManagementPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({ user_id: '', message: '', sendToAll: false });
  const [editNotification, setEditNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getAllNotifications();
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!newNotification.message) {
      toast.error('Message is required');
      return;
    }

    if (!newNotification.sendToAll && !newNotification.user_id) {
      toast.error('User ID is required when not sending to all users');
      return;
    }

    try {
      const data = {
        message: newNotification.message,
        ...(newNotification.sendToAll ? {} : { user_id: parseInt(newNotification.user_id) }),
      };
      await notificationService.createNotification(data);
      toast.success(newNotification.sendToAll ? 'Notifications sent to all users' : 'Notification created successfully');
      setIsCreateDialogOpen(false);
      setNewNotification({ user_id: '', message: '', sendToAll: false });
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to create notification');
      console.error('Error creating notification:', err);
    }
  };

  const handleEditNotification = async () => {
    if (!editNotification || !editNotification.message) {
      toast.error('Message is required');
      return;
    }

    try {
      await notificationService.updateNotification(editNotification.id, { message: editNotification.message });
      toast.success('Notification updated successfully');
      setIsEditDialogOpen(false);
      setEditNotification(null);
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to update notification');
      console.error('Error updating notification:', err);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await notificationService.deleteNotification(id);
      toast.success('Notification deleted successfully');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to delete notification');
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      toast.success('Notification marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          Notification Management
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600">
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendToAll"
                  checked={newNotification.sendToAll}
                  onCheckedChange={(checked) =>
                    setNewNotification({ ...newNotification, sendToAll: !!checked, user_id: '' })
                  }
                />
                <Label htmlFor="sendToAll">Send to all users</Label>
              </div>
              {!newNotification.sendToAll && (
                <div className="space-y-2">
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    placeholder="Enter User ID"
                    value={newNotification.user_id}
                    onChange={(e) => setNewNotification({ ...newNotification, user_id: e.target.value })}
                    type="number"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="Enter message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                />
              </div>
              <Button
                onClick={handleCreateNotification}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
              >
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
            <CardTitle className="flex justify-between items-center">
              <span>All Notifications</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchNotifications}
                className="text-blue-600 hover:text-blue-800"
              >
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2 text-gray-500">Loading notifications...</p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No notifications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id} className={notification.is_read ? "" : "bg-blue-50 dark:bg-blue-900/20"}>
                        <TableCell>{notification.user.username}</TableCell>
                        <TableCell className="max-w-xs truncate">{notification.message}</TableCell>
                        <TableCell>
                          <Badge variant={notification.is_read ? "outline" : "default"}>
                            {notification.is_read ? 'Read' : 'Unread'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(notification.created_at).toLocaleString()}</TableCell>
                        <TableCell className="flex flex-wrap gap-2">
                          {!notification.is_read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Mark as Read
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditNotification(notification);
                              setIsEditDialogOpen(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
          </DialogHeader>
          {editNotification && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_message">Message</Label>
                <Input
                  id="edit_message"
                  value={editNotification.message}
                  onChange={(e) =>
                    setEditNotification({ ...editNotification, message: e.target.value })
                  }
                />
              </div>
              <div className="text-sm text-gray-500">
                <p>Sent to: {editNotification.user.username}</p>
                <p>Status: {editNotification.is_read ? 'Read' : 'Unread'}</p>
                <p>Created: {new Date(editNotification.created_at).toLocaleString()}</p>
              </div>
              <Button
                onClick={handleEditNotification}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
              >
                Update
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}