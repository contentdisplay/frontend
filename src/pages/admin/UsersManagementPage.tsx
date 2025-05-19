import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import userService from '@/services/admin/userService';
import { motion } from 'framer-motion';
import { User } from '@/services/admin/userService';
import { Loader2, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUser, setNewUser] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'normal' 
  });
  const [editedUser, setEditedUser] = useState({
    username: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper function to extract page number from URL
  const extractPageFromUrl = (url: string): number => {
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const fetchUsers = async (url?: string) => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers(url);
      
      // Check if data has the expected pagination structure
      if (data && typeof data === 'object' && Array.isArray(data.results)) {
        setUsers(data.results);
        setPagination({
          count: data.count || 0,
          next: data.next,
          previous: data.previous,
          currentPage: url ? extractPageFromUrl(url) : 1
        });
      } else if (Array.isArray(data)) {
        // Handle case where API might return an array directly
        setUsers(data);
        setPagination({
          count: data.length,
          next: null,
          previous: null,
          currentPage: 1
        });
      } else {
        console.error('Expected array of users or paginated object but got:', data);
        setUsers([]);
        toast.error('Received invalid user data format');
      }
    } catch (err) {
      toast.error('Failed to fetch users');
      console.error(err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.username || !newUser.email || !newUser.password) {
        toast.error('All fields are required');
        return;
      }
      
      await userService.createUser({ 
        ...newUser, 
        profile: { role: newUser.role } 
      });
      
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      // Reset form
      setNewUser({ username: '', email: '', password: '', role: 'normal' });
      fetchUsers();
    } catch (err) {
      toast.error('Failed to create user');
      console.error(err);
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;
      
      await userService.updateUser(selectedUser.id, {
        username: editedUser.username,
        email: editedUser.email,
        profile: { ...selectedUser.profile, role: editedUser.role }
      });
      
      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userService.deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
      console.error(err);
    }
  };

  const handleUpdateRole = async (id: number, role: string) => {
    try {
      await userService.updateUserRole(id, role);
      toast.success(`User role updated to ${role}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user role');
      console.error(err);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditedUser({
      username: user.username,
      email: user.email,
      role: user.profile?.role || 'normal'
    });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = searchQuery 
    ? users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          User Management
        </h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => fetchUsers()} 
            variant="outline" 
            size="icon" 
            className="rounded-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-500">Add User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="normal">Normal User</option>
                  <option value="writer">Content Writer</option>
                  <option value="admin">Admin</option>
                </select>
                <Button onClick={handleCreateUser} className="w-full bg-gradient-to-r from-blue-600 to-indigo-500">
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Users ({filteredUsers.length})</span>
              {pagination.count > 0 && (
                <span className="text-sm text-gray-500 font-normal">
                  Total: {pagination.count} users
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? "No users found matching your search" : "No users found"}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.is_verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                              Unverified
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <select
                            value={user.profile?.role || 'normal'}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="p-1 border rounded text-sm"
                          >
                            <option value="normal">Normal User</option>
                            <option value="writer">Content Writer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {(pagination.next || pagination.previous) && (
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      Page {pagination.currentPage}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.previous}
                        onClick={() => pagination.previous && fetchUsers(pagination.previous)}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.next}
                        onClick={() => pagination.next && fetchUsers(pagination.next)}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Username"
              value={editedUser.username}
              onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={editedUser.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
            />
            <select
              value={editedUser.role}
              onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="normal">Normal User</option>
              <option value="writer">Content Writer</option>
              <option value="admin">Admin</option>
            </select>
            <Button onClick={handleUpdateUser} className="w-full bg-gradient-to-r from-blue-600 to-indigo-500">
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}