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
import { Loader2, Search, RefreshCw, ChevronLeft, ChevronRight, UserPlus, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  profile: {
    role: string;
    first_name?: string;
    last_name?: string;
  };
}

interface UpdateUserData {
  username: string;
  email: string;
  profile: {
    role: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
    age?: number;
    gender?: string;
    bio?: string;
  };
}

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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  
  const [newUser, setNewUser] = useState<CreateUserData>({ 
    username: '', 
    email: '', 
    password: '', 
    profile: {
      role: 'normal',
      first_name: '',
      last_name: ''
    }
  });
  
  const [editedUser, setEditedUser] = useState<UpdateUserData>({
    username: '',
    email: '',
    profile: {
      role: 'normal',
      first_name: '',
      last_name: '',
      phone_number: '',
      address: '',
      age: undefined,
      gender: '',
      bio: ''
    }
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
        toast.error('Username, email, and password are required');
        return;
      }
      
      await userService.createUser(newUser);
      
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      // Reset form
      setNewUser({ 
        username: '', 
        email: '', 
        password: '', 
        profile: {
          role: 'normal',
          first_name: '',
          last_name: ''
        }
      });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
      console.error(err);
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;
      
      await userService.updateUser(selectedUser.id, editedUser);
      
      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
      console.error(err);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) return;
    
    try {
      await userService.deleteUser(user.id);
      toast.success(`User "${user.username}" deleted successfully`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
      console.error(err);
    }
  };

  const handleUpdateRole = async (userId: number, role: string) => {
    try {
      await userService.updateUserRole(userId, role);
      toast.success(`User role updated to ${role}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role');
      console.error(err);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditedUser({
      username: user.username,
      email: user.email,
      profile: {
        role: user.profile?.role || 'normal',
        first_name: user.profile?.first_name || '',
        last_name: user.profile?.last_name || '',
        phone_number: user.profile?.phone_number || '',
        address: user.profile?.address || '',
        age: user.profile?.age || undefined,
        gender: user.profile?.gender || '',
        bio: user.profile?.bio || ''
      }
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'writer': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.profile?.full_name && user.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.profile?.role === roleFilter;
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && user.is_verified) ||
      (verificationFilter === 'unverified' && !user.is_verified);
    
    return matchesSearch && matchesRole && matchesVerification;
  });

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
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-500">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={newUser.profile.first_name}
                      onChange={(e) => setNewUser({
                        ...newUser,
                        profile: { ...newUser.profile, first_name: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      value={newUser.profile.last_name}
                      onChange={(e) => setNewUser({
                        ...newUser,
                        profile: { ...newUser.profile, last_name: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    placeholder="Email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.profile.role}
                    onValueChange={(value) => setNewUser({
                      ...newUser,
                      profile: { ...newUser.profile, role: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal User</SelectItem>
                      <SelectItem value="writer">Content Writer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleCreateUser} className="w-full bg-gradient-to-r from-blue-600 to-indigo-500">
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="normal">Normal User</SelectItem>
            <SelectItem value="writer">Content Writer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={verificationFilter} onValueChange={setVerificationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
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
                {searchQuery || roleFilter !== 'all' || verificationFilter !== 'all' 
                  ? "No users found matching your filters" 
                  : "No users found"}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">{user.id}</TableCell>
                        <TableCell className="font-medium">
                          {user.profile?.full_name || 'Not set'}
                        </TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={user.is_verified 
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          }>
                            {user.is_verified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.profile?.role || 'normal'}
                            onValueChange={(value) => handleUpdateRole(user.id, value)}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal User</SelectItem>
                              <SelectItem value="writer">Content Writer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openViewDialog(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
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

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Username</Label>
                  <p className="text-sm">{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="text-sm">{selectedUser.profile?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedUser.profile?.phone_number || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Age</Label>
                  <p className="text-sm">{selectedUser.profile?.age || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Gender</Label>
                  <p className="text-sm">{selectedUser.profile?.gender || 'Not set'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm">{selectedUser.profile?.address || 'Not set'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Bio</Label>
                  <p className="text-sm">{selectedUser.profile?.bio || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={selectedUser.is_verified 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                  }>
                    {selectedUser.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <Badge className={getRoleBadgeColor(selectedUser.profile?.role || 'normal')}>
                    {selectedUser.profile?.role || 'normal'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  placeholder="First name"
                  value={editedUser.profile.first_name}
                  onChange={(e) => setEditedUser({
                    ...editedUser,
                    profile: { ...editedUser.profile, first_name: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  placeholder="Last name"
                  value={editedUser.profile.last_name}
                  onChange={(e) => setEditedUser({
                    ...editedUser,
                    profile: { ...editedUser.profile, last_name: e.target.value }
                  })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                placeholder="Username"
                value={editedUser.username}
                onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                placeholder="Email"
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  placeholder="Phone number"
                  value={editedUser.profile.phone_number}
                  onChange={(e) => setEditedUser({
                    ...editedUser,
                    profile: { ...editedUser.profile, phone_number: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  placeholder="Age"
                  type="number"
                  value={editedUser.profile.age || ''}
                  onChange={(e) => setEditedUser({
                    ...editedUser,
                    profile: { ...editedUser.profile, age: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-gender">Gender</Label>
              <Select
                value={editedUser.profile.gender}
                onValueChange={(value) => setEditedUser({
                  ...editedUser,
                  profile: { ...editedUser.profile, gender: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                placeholder="Address"
                value={editedUser.profile.address}
                onChange={(e) => setEditedUser({
                  ...editedUser,
                  profile: { ...editedUser.profile, address: e.target.value }
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editedUser.profile.role}
                onValueChange={(value) => setEditedUser({
                  ...editedUser,
                  profile: { ...editedUser.profile, role: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal User</SelectItem>
                  <SelectItem value="writer">Content Writer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleUpdateUser} className="w-full bg-gradient-to-r from-blue-600 to-indigo-500">
              Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}