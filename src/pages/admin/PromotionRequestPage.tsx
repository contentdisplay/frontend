import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Check, X, Eye, AlertTriangle, RefreshCw, Wallet, Clock, Info, User } from 'lucide-react';
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
  id: number;
  user_id: number;
  balance: number;
  last_transaction_date: string | null;
}

export default function AdminPromotionRequestsPage() {
  const [promotions, setPromotions] = useState<PromotionRequest[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionRequest | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [selectedUserWallet, setSelectedUserWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

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
      const [userProfile, userWallet] = await Promise.all([
        adminPromotionService.getUserProfile(promotion.user?.id || 0),
        adminPromotionService.getUserWallet(promotion.user?.id || 0)
      ]);
      
      setSelectedUserProfile(userProfile);
      setSelectedUserWallet(userWallet);
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
        await adminPromotionService.approvePromotion(selectedPromotion.id);
        toast.success('Promotion request approved');
      } else {
        await adminPromotionService.rejectPromotion(selectedPromotion.id, 'Request rejected by admin');
        toast.success('Promotion request rejected');
      }
      fetchPromotions();
      setConfirmDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${actionType} promotion request`);
    } finally {
      setProcessingAction(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          Promotion Requests
        </h1>
        <Button 
          onClick={fetchPromotions}
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
                <TabsTrigger value="request">Request</TabsTrigger>
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
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="capitalize bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            {selectedUserProfile.role}
                          </Badge>
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

                    {selectedUserWallet.last_transaction_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Last Transaction</p>
                        <p className="font-medium">{formatDate(selectedUserWallet.last_transaction_date)}</p>
                      </div>
                    )}

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
                        <div>User's role will be updated to "writer"</div>
                      </li>
                    </ul>
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
                ? 'Are you sure you want to approve this promotion request? This will deduct 50 credits from the user\'s wallet.'
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
                <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Current Balance:</span>
                  </div>
                  <span className="font-bold">{selectedUserWallet.balance} credits</span>
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