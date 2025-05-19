import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Check, X, Eye, AlertTriangle, RefreshCw, Wallet, Clock, 
  Info, User, UserPlus, Shield, Users, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import adminPromotionService from '@/services/admin/promotionService';
import { motion } from 'framer-motion';

interface PromotionRequest {
  id: number;
  user?: {
    id: number;
    username: string;
    email?: string;
  };
  status: string;
  requested_at: string;
  reviewed_at: string | null;
}

interface UserProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  age: number;
  gender: string;
  role: string;
  avatar: string | null;
}

interface UserWallet {
  id: string;
  balance: number;
  reward_points?: number;
  total_earning?: number;
  total_spending?: number;
  status?: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  groups: string[];
  is_staff: boolean;
  is_superuser: boolean;
}

export default function AdminPromotionRequestsPage() {
  const [promotions, setPromotions] = useState<PromotionRequest[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionRequest | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [selectedUserWallet, setSelectedUserWallet] = useState<UserWallet | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
  const [processingAction, setProcessingAction] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<string[]>(['Normal User', 'Content Writer', 'Admin']);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [updatingGroup, setUpdatingGroup] = useState(false);
  const [deductBalance, setDeductBalance] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchPromotions();
    fetchAvailableGroups();
  }, [refreshTrigger]);

  const fetchAvailableGroups = async () => {
    try {
      const groups = await adminPromotionService.getAvailableGroups();
      if (groups && groups.length > 0) {
        setAvailableGroups(groups);
      }
    } catch (err) {
      console.error('Failed to fetch available groups:', err);
      // Fall back to default groups
    }
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await adminPromotionService.getPendingPromotions();
      setPromotions(data);
    } catch (err) {
      toast.error('Failed to fetch promotion requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (promotion: PromotionRequest) => {
    setSelectedPromotion(promotion);
    setUserDialogOpen(true);
    
    try {
      const [userProfile, userWallet, userData] = await Promise.all([
        adminPromotionService.getUserProfile(promotion.user?.id || 0),
        adminPromotionService.getUserWallet(promotion.user?.id || 0),
        adminPromotionService.getUserData(promotion.user?.id || 0)
      ]);
      
      setSelectedUserProfile(userProfile);
      setSelectedUserWallet(userWallet);
      setSelectedUserData(userData);
      
      // Set the initial selected group based on user's current groups
      if (userData.groups && userData.groups.length > 0) {
        if (userData.groups.includes('admin')) {
          setSelectedGroup('admin');
        } else if (userData.groups.includes('Content Writer')) {
          setSelectedGroup('Content Writer');
        } else {
          setSelectedGroup('Normal User');
        }
      } else {
        setSelectedGroup('Normal User');
      }
    } catch (err) {
      toast.error('Failed to fetch user details');
    }
  };

  const handleAction = (promotion: PromotionRequest, status: 'approved' | 'rejected') => {
    setSelectedPromotion(promotion);
    setActionType(status);
    setConfirmDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedPromotion) return;
    
    setProcessingAction(true);
    try {
      if (actionType === 'approved') {
        const response = await adminPromotionService.approvePromotion(selectedPromotion.id);
        toast.success(
          `Promotion request approved. ${response.balance_deducted || 50} credits deducted.` + 
          (response.new_balance ? ` New balance: ${response.new_balance}` : '')
        );
      } else {
        await adminPromotionService.rejectPromotion(selectedPromotion.id, 'Request rejected by admin');
        toast.success('Promotion request rejected');
      }
      setConfirmDialogOpen(false);
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
    } catch (err: any) {
      toast.error(err.message || `Failed to ${actionType} promotion request`);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleGroupUpdate = async () => {
    if (!selectedPromotion?.user || !selectedGroup) return;
    
    setUpdatingGroup(true);
    try {
      const response = await adminPromotionService.updateUserGroup(
        selectedPromotion.user.id, 
        selectedGroup,
        deductBalance
      );
      
      // Show appropriate toast based on deduction
      if (response.balance_deducted > 0) {
        toast.success(`User added to "${selectedGroup}" group. ${response.balance_deducted} credits deducted.`);
      } else {
        toast.success(`User added to "${selectedGroup}" group.`);
      }
      
      // Update local userData state to reflect group changes
      if (selectedUserData) {
        let newGroups: string[] = [];
        
        // Handle special cases for different groups
        if (selectedGroup === 'admin') {
          newGroups = ['admin'];
        } else if (selectedGroup === 'Content Writer') {
          newGroups = ['Content Writer'];
        } else {
          newGroups = ['Normal User'];
        }
        
        setSelectedUserData({
          ...selectedUserData,
          groups: newGroups,
          is_staff: selectedGroup === 'admin',
          is_superuser: selectedGroup === 'admin'
        });
      }
      
      // Update profile role if needed
      if (selectedUserProfile) {
        let newRole = 'normal';
        if (selectedGroup === 'admin') newRole = 'admin';
        else if (selectedGroup === 'Content Writer') newRole = 'writer';
        
        setSelectedUserProfile({
          ...selectedUserProfile,
          role: newRole
        });
      }
      
      // Update wallet if balance was deducted
      if (response.balance_deducted > 0 && selectedUserWallet && response.new_balance !== null) {
        setSelectedUserWallet({
          ...selectedUserWallet,
          balance: response.new_balance
        });
      }
      
      setGroupDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user group');
    } finally {
      setUpdatingGroup(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Check if profile is complete
  const isProfileComplete = (profile: UserProfile | null) => {
    if (!profile) return false;
    
    const requiredFields = [
      'first_name', 
      'last_name', 
      'phone_number', 
      'address', 
      'age', 
      'gender'
    ];
    
    return requiredFields.every(field => 
      Boolean((profile as any)[field])
    );
  };

  const getGroupBadgeClass = (group: string) => {
    switch(group) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
      case 'Content Writer':
        return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          Promotion Requests
        </h1>
        <Button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <CardTitle>Pending Promotion Requests</CardTitle>
            <CardDescription>
              Review and manage user requests to become content writers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600"></div>
              </div>
            ) : promotions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No pending promotion requests available.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Requested At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              {promotion.user?.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{promotion.user?.username || 'Unknown User'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(promotion.requested_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewUser(promotion)}
                            disabled={!promotion.user}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(promotion, 'approved')}
                            disabled={!promotion.user}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleAction(promotion, 'rejected')}
                            disabled={!promotion.user}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Details Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Review user information before approving promotion request
            </DialogDescription>
          </DialogHeader>

          {selectedPromotion && selectedPromotion.user ? (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="groups">Group Management</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-4">
                {selectedUserProfile ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 ring-2 ring-blue-100 dark:ring-blue-900/50">
                        {selectedUserProfile.avatar ? (
                          <AvatarImage src={selectedUserProfile.avatar} alt={selectedUserProfile.first_name} />
                        ) : (
                          <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {selectedUserProfile.first_name?.charAt(0) || selectedPromotion.user.username.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedUserProfile.first_name} {selectedUserProfile.last_name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {selectedUserData?.groups.map(group => (
                            <Badge key={group} className={`capitalize ${getGroupBadgeClass(group)}`}>
                              {group}
                            </Badge>
                          ))}
                          {isProfileComplete(selectedUserProfile) ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                              Profile Complete
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Incomplete Profile
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Username</p>
                        <p className="font-medium">{selectedPromotion.user.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedPromotion.user.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedUserProfile.phone_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-medium">{selectedUserProfile.age || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium capitalize">{selectedUserProfile.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{selectedUserProfile.address || 'N/A'}</p>
                      </div>
                    </div>

                    {!isProfileComplete(selectedUserProfile) && (
                      <Alert className="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                          This user's profile is incomplete. Required information is missing.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600"></div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="wallet" className="mt-4">
                {selectedUserWallet ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-3xl font-bold">{selectedUserWallet.balance} credits</p>
                      </div>
                      <Wallet className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    {selectedUserWallet.reward_points !== undefined && (
                      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Reward Points</p>
                          <p className="text-xl font-bold">{selectedUserWallet.reward_points} points</p>
                        </div>
                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                          <span className="text-green-700 dark:text-green-300 text-lg font-bold">+</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {selectedUserWallet.total_earning !== undefined && (
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Total Earnings</p>
                          <p className="text-xl font-bold">{selectedUserWallet.total_earning} credits</p>
                        </div>
                      )}
                      
                      {selectedUserWallet.total_spending !== undefined && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Total Spending</p>
                          <p className="text-xl font-bold">{selectedUserWallet.total_spending} credits</p>
                        </div>
                      )}
                    </div>

                    {selectedUserWallet.balance < 50 && (
                      <Alert className="mt-4 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/40">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700 dark:text-red-300">
                          Insufficient balance. The user needs at least 50 credits to become a writer.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600"></div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="request" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Requested On</p>
                    <p className="font-medium">{formatDate(selectedPromotion.requested_at)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="mt-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      PENDING
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      Promotion Process
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5">1.</div>
                        <div>Check if user profile is complete</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5">2.</div>
                        <div>Verify user has at least 50 credits in wallet</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5">3.</div>
                        <div>Upon approval, 50 credits will be deducted from wallet</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5">4.</div>
                        <div>User will be added to the "Content Writer" group</div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5">5.</div>
                        <div>User will receive notification of promotion approval</div>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="groups" className="mt-4">
                <div className="space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-5">
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                      <Users className="h-5 w-5" />
                      Manage User Groups
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Assign the user to a specific group. This will update their permissions and access levels.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Current Groups</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedUserData?.groups && selectedUserData.groups.length > 0 ? (
                            selectedUserData.groups.map(group => (
                              <Badge key={group} className={`capitalize ${getGroupBadgeClass(group)}`}>
                                {group}
                              </Badge>
                            ))
                          ) : (
                            <Badge>No Groups</Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Change Group</p>
                        <div className="flex gap-2">
                          <Select 
                            value={selectedGroup} 
                            onValueChange={setSelectedGroup}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Normal User">Normal User</SelectItem>
                              <SelectItem value="Content Writer">Content Writer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={handleGroupUpdate}
                            disabled={
                              !selectedGroup || 
                              (selectedUserData?.groups.includes(selectedGroup)) || 
                              updatingGroup
                            }
                          >
                            {updatingGroup ? (
                              <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full"></div>
                            ) : (
                              'Update'
                            )}
                          </Button>
                        </div>
                      </div>

                      {selectedGroup === 'Content Writer' && !selectedUserData?.groups.includes('Content Writer') && (
                        <div className="flex items-center space-x-2 mt-3">
                          <Switch
                            id="deduct-balance"
                            checked={deductBalance}
                            onCheckedChange={setDeductBalance}
                          />
                          <label
                            htmlFor="deduct-balance"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Deduct 50 credits when adding to Content Writer group
                          </label>
                        </div>
                      )}

                      {selectedGroup === 'Content Writer' && deductBalance && !selectedUserData?.groups.includes('Content Writer') && (
                        <Alert className="mt-3 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40">
                          <DollarSign className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-700 dark:text-amber-300">
                            This action will deduct 50 credits from the user's wallet.
                            {selectedUserWallet && (
                              <div className="mt-1">
                                Current balance: <b>{selectedUserWallet.balance}</b> credits
                                <br />
                                Balance after deduction: <b>{Math.max(0, selectedUserWallet.balance - 50)}</b> credits
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      <h5 className="font-medium text-sm">Group Permissions</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                          <h6 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-blue-600" />
                            Normal User
                          </h6>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• View content</li>
                            <li>• Update profile</li>
                            <li>• Request promotion</li>
                          </ul>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border-2 border-green-100 dark:border-green-900/30">
                          <h6 className="font-medium text-sm mb-2 flex items-center gap-1 text-green-700 dark:text-green-400">
                            <UserPlus className="h-3.5 w-3.5" />
                            Content Writer
                          </h6>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Create articles</li>
                            <li>• Edit own articles</li>
                            <li>• Earn from content</li>
                          </ul>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                          <h6 className="font-medium text-sm mb-2 flex items-center gap-1 text-purple-700 dark:text-purple-400">
                            <Shield className="h-3.5 w-3.5" />
                            Admin
                          </h6>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Full system access</li>
                            <li>• Manage all users</li>
                            <li>• Approve promotions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>User information not available.</p>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="destructive"
                onClick={() => {
                  setUserDialogOpen(false);
                  handleAction(selectedPromotion!, 'rejected');
                }}
                disabled={!selectedPromotion?.user}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setUserDialogOpen(false);
                  handleAction(selectedPromotion!, 'approved');
                }}
                disabled={
                  !selectedPromotion?.user ||
                  !selectedUserProfile || 
                  !selectedUserWallet || 
                  !isProfileComplete(selectedUserProfile) || 
                  selectedUserWallet.balance < 50
                }
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approved' ? 'Approve Promotion Request' : 'Reject Promotion Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approved' 
                ? 'Are you sure you want to approve this promotion request? This will deduct 50 credits from the user\'s wallet and add them to the "Content Writer" group.'
                : 'Are you sure you want to reject this promotion request?'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedPromotion && selectedPromotion.user ? (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {selectedPromotion.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPromotion.user.username}</p>
                  <p className="text-sm text-muted-foreground">Requested on {formatDate(selectedPromotion.requested_at)}</p>
                </div>
              </div>
              
              {actionType === 'approved' && selectedUserWallet && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Current Balance:</span>
                    </div>
                    <span className="font-bold">{selectedUserWallet.balance} credits</span>
                  </div>
                  
                  {selectedUserWallet.balance < 50 && (
                    <Alert variant="destructive">
                      <AlertTitle>Insufficient Balance</AlertTitle>
                      <AlertDescription>
                        The user doesn't have the required 50 credits to be promoted to Content Writer.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              <p>User information not available.</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={processingAction}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              className={actionType === 'approved' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              disabled={processingAction || !selectedPromotion?.user || (actionType === 'approved' && selectedUserWallet?.balance < 50)}
            >
              {processingAction ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approved' ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}