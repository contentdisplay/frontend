import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import api from '@/services/api';

// Define interfaces for type safety
interface QRCode {
  id: number;
  image: string;
  description: string;
  created_at: string;
}

interface PaymentRequest {
  id: string;
  user: number | string;
  user_name: string;
  request_type: 'deposit' | 'withdraw';
  amount: number | string;
  screenshot: string;
  qr_code?: {
    id: number;
    image: string;
    description: string;
    created_at: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
  admin_note?: string;
}

interface Transaction {
  id: string;
  user: number | string;
  user_name?: string;
  transaction_type: 'deposit' | 'withdraw' | 'earn' | 'spend' | 'refund' | 'reward';
  article_title?: string;
  amount: number | string;
  date: string;
  status?: string;
  description?: string;
}

interface WalletInfo {
  id: string;
  balance: number | string;
  reward_points?: number | string;
  total_earning: number | string;
  total_spending: number | string;
  user: string | number;
  user_name?: string;
  user_id?: string;
  status?: string;
  full_name?: string;
  profile_photo?: string;
}

interface TransactionSummary {
  total_deposits: number;
  total_withdrawals: number;
  total_earnings: number;
  total_spending: number;
  total_rewards: number;
  total_wallet_balance: number;
  total_reward_points: number;
  transaction_counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
  pending_payment_requests: number;
}

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
}

export default function WalletQRManagement() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null);
  
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingQRCodes, setIsLoadingQRCodes] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  
  // Load Balance Dialog States - SIMPLIFIED APPROACH
  const [showLoadBalanceDialog, setShowLoadBalanceDialog] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loadAmount, setLoadAmount] = useState<string>('');
  const [loadDescription, setLoadDescription] = useState<string>('');
  const [loadTransactionType, setLoadTransactionType] = useState<'deposit' | 'reward'>('deposit');
  const [userSearch, setUserSearch] = useState<string>('');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Transaction filters
  const [transactionType, setTransactionType] = useState<string>("all");
  const [transactionStatus, setTransactionStatus] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>('');
  const [startDateStr, setStartDateStr] = useState<string>('');
  const [endDateStr, setEndDateStr] = useState<string>('');
  
  // Ref to prevent multiple API calls
  const loadUsersRef = useRef<boolean>(false);
  
  // COMPLETELY REWRITTEN: Load all users ONCE when dialog opens
  const loadAllUsers = useCallback(async () => {
    if (loadUsersRef.current) return; // Prevent multiple calls
    
    try {
      loadUsersRef.current = true;
      setIsLoadingUsers(true);
      
      const response = await api.get('/wallet/admin/users/');
      const users = response.data.users || response.data || [];
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error("Failed to load users");
      setAllUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // SIMPLE CLIENT-SIDE FILTERING - No API calls on search
  useEffect(() => {
    if (!userSearch.trim()) {
      setFilteredUsers(allUsers);
      return;
    }
    
    const searchLower = userSearch.toLowerCase();
    const filtered = allUsers.filter(user => 
      user.username.toLowerCase().includes(searchLower) ||
      user.full_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
    setFilteredUsers(filtered);
  }, [userSearch, allUsers]);

  // Load data on component mount
  useEffect(() => {
    loadPaymentRequests();
    loadQRCodes();
    loadAdminTransactions();
    loadAdminWallets();
    loadTransactionSummary();
  }, []);

  // Load payment requests for the Payments tab
  const loadPaymentRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const response = await api.get('/wallet/admin/payment-requests/');
      
      const results = Array.isArray(response.data) ? response.data : (response.data.results || []);
      
      if (results.length > 0) {
        setPaymentRequests(results.map((req: any) => ({
          ...req,
          amount: typeof req.amount === 'string' ? parseFloat(req.amount) : req.amount
        })));
      } else {
        setPaymentRequests([]);
      }
    } catch (error: any) {
      console.error('Error loading payment requests:', error.message);
      toast.error("Failed to load payment requests");
      setPaymentRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Load QR codes for the QR Codes tab
  const loadQRCodes = async () => {
    try {
      setIsLoadingQRCodes(true);
      const response = await api.get('/wallet/admin/qr-codes/');
      const results = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setQRCodes(results);
    } catch (error: any) {
      console.error('Error loading QR codes:', error);
      toast.error("Failed to load QR codes");
      setQRCodes([]);
    } finally {
      setIsLoadingQRCodes(false);
    }
  };

  // Load admin transactions for the Transactions tab
  const loadAdminTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      
      let url = '/wallet/admin/transactions/';
      const params = new URLSearchParams();
      
      if (transactionType && transactionType !== "all") {
        params.append('transaction_type', transactionType);
      }
      
      if (transactionStatus && transactionStatus !== "all") {
        params.append('status', transactionStatus);
      }
      
      if (userFilter) {
        params.append('user_id', userFilter);
      }
      
      if (startDateStr && endDateStr) {
        params.append('start_date', startDateStr);
        params.append('end_date', endDateStr);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      
      const formattedTransactions = data.map((tx: any) => ({
        ...tx,
        amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
      }));
      
      setTransactions(formattedTransactions);
    } catch (error: any) {
      console.error('Error loading admin transactions:', error);
      toast.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Load admin wallets for the Calculator tab
  const loadAdminWallets = async () => {
    try {
      setIsLoadingWallets(true);
      const response = await api.get('/wallet/admin/wallets/');
      const walletData = Array.isArray(response.data) ? response.data : (response.data.results || []);
      
      const formattedWallets = walletData.map((wallet: any) => ({
        ...wallet,
        balance: typeof wallet.balance === 'string' ? parseFloat(wallet.balance) : wallet.balance,
        reward_points: typeof wallet.reward_points === 'string' ? parseFloat(wallet.reward_points) : wallet.reward_points,
        total_earning: typeof wallet.total_earning === 'string' ? parseFloat(wallet.total_earning) : wallet.total_earning,
        total_spending: typeof wallet.total_spending === 'string' ? parseFloat(wallet.total_spending) : wallet.total_spending,
      }));
      
      setWallets(formattedWallets);
    } catch (error: any) {
      console.error('Error loading admin wallets:', error);
      toast.error("Failed to load wallet information");
      setWallets([]);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  // Load transaction summary for the Calculator tab
  const loadTransactionSummary = async () => {
    try {
      setIsLoadingSummary(true);
      
      let url = '/wallet/admin/transaction-summary/';
      const params = new URLSearchParams();
      
      if (startDateStr && endDateStr) {
        params.append('start_date', startDateStr);
        params.append('end_date', endDateStr);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      setTransactionSummary(response.data);
    } catch (error: any) {
      console.error('Error loading transaction summary:', error);
      toast.error("Failed to load transaction summary");
      
      setTransactionSummary({
        total_deposits: 0,
        total_withdrawals: 0,
        total_earnings: 0,
        total_spending: 0,
        total_rewards: 0,
        total_wallet_balance: 0,
        total_reward_points: 0,
        transaction_counts: {
          pending: 0,
          approved: 0,
          rejected: 0
        },
        pending_payment_requests: 0
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Load balance for user
  const handleLoadBalance = async () => {
    if (!selectedUserId || !loadAmount) {
      toast.error("Please select a user and enter an amount");
      return;
    }

    const amount = parseFloat(loadAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsLoadingBalance(true);
      
      const response = await api.post('/wallet/admin/load-user-balance/', {
        user_id: parseInt(selectedUserId),
        amount: amount,
        description: loadDescription || `Admin loaded ${loadTransactionType}: ₹${amount}`,
        transaction_type: loadTransactionType
      });

      toast.success(response.data.detail);
      
      // Reset form and close dialog
      handleCloseLoadBalanceDialog();
      
      // Reload data
      loadAdminWallets();
      loadAdminTransactions();
      loadTransactionSummary();
      
    } catch (error: any) {
      console.error('Error loading balance:', error);
      toast.error(error.response?.data?.detail || "Failed to load balance");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Reload data when filters change
  const applyFilters = () => {
    loadAdminTransactions();
    loadTransactionSummary();
  };

  // Reset filters
  const resetFilters = () => {
    setTransactionType("all");
    setTransactionStatus("all");
    setUserFilter('');
    setStartDateStr('');
    setEndDateStr('');
    loadAdminTransactions();
    loadTransactionSummary();
  };

  // Payment request action handling
  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    try {
      await api.post(`/wallet/admin/payment-requests/${selectedRequest.id}/action/`, {
        action,
        admin_note: adminNote || ''
      });
      
      toast.success(`Payment request ${action}d successfully`);
      setShowActionDialog(false);
      setSelectedRequest(null);
      setAdminNote('');
      
      // Reload data after successful action
      loadPaymentRequests();
      loadAdminTransactions();
      loadAdminWallets();
      loadTransactionSummary();
    } catch (error: any) {
      console.error(`Failed to ${action} payment request:`, error);
      toast.error(`Failed to ${action} payment request: ${error.response?.data?.detail || error.message}`);
    }
  };

  // QR code handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !description) {
      toast.error("Please select a file and provide a description");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('description', description);
      
      await api.post('/wallet/admin/qr-codes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("QR code uploaded successfully");
      setFile(null);
      setDescription('');
      loadQRCodes();
    } catch (error: any) {
      console.error("Failed to upload QR code:", error);
      toast.error("Failed to upload QR code");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/wallet/admin/qr-codes/${id}/`);
      toast.success("QR code deleted successfully");
      loadQRCodes();
    } catch (error: any) {
      console.error("Failed to delete QR code:", error);
      toast.error("Failed to delete QR code");
    }
  };

  // Helper function for formatting amounts
  const formatAmount = (amount: number | string | undefined): string => {
    if (typeof amount === 'undefined' || amount === null) return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // SIMPLE DIALOG HANDLERS
  const handleOpenLoadBalanceDialog = () => {
    setShowLoadBalanceDialog(true);
    loadAllUsers(); // Load users once when dialog opens
  };

  const handleCloseLoadBalanceDialog = () => {
    setShowLoadBalanceDialog(false);
    setSelectedUserId('');
    setLoadAmount('');
    setLoadDescription('');
    setLoadTransactionType('deposit');
    setUserSearch('');
    setAllUsers([]);
    setFilteredUsers([]);
    loadUsersRef.current = false; // Reset the ref to allow future loads
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Wallet Management</h2>
        <Button 
          onClick={handleOpenLoadBalanceDialog}
          className="bg-green-600 hover:bg-green-700"
        >
          Load User Balance
        </Button>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid grid-cols-4 w-[400px]">
          <TabsTrigger value="payments">Payment Requests</TabsTrigger>
          <TabsTrigger value="qr">QR Codes</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="calculator">Balance Summary</TabsTrigger>
        </TabsList>

        {/* Payment Requests Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Screenshot</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingRequests ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                          Loading requests...
                        </TableCell>
                      </TableRow>
                    ) : paymentRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                          No payment requests
                        </TableCell>
                      </TableRow>
                    ) : (
                      paymentRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.user_name}</TableCell>
                          <TableCell>{request.request_type}</TableCell>
                          <TableCell>₹{formatAmount(request.amount)}</TableCell>
                          <TableCell>
                            {request.screenshot && (
                              <a href={request.screenshot} target="_blank" rel="noopener noreferrer">
                                <img src={request.screenshot} alt="Screenshot" className="w-16 h-16 object-cover" />
                              </a>
                            )}
                          </TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowActionDialog(true);
                                }}
                              >
                                Review
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Codes Tab */}
        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>Manage QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qrCodeFile">Upload QR Code Image</Label>
                  <Input
                    id="qrCodeFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description for the QR code"
                  />
                </div>
                <Button onClick={handleUpload} disabled={!file || !description}>
                  Upload QR Code
                </Button>
              </div>

              <div className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingQRCodes ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                            Loading QR codes...
                          </TableCell>
                        </TableRow>
                      ) : qrCodes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                            No QR codes available
                          </TableCell>
                        </TableRow>
                      ) : (
                        qrCodes.map((qrCode) => (
                          <TableRow key={qrCode.id}>
                            <TableCell>{qrCode.id}</TableCell>
                            <TableCell>{qrCode.description}</TableCell>
                            <TableCell>
                              <img src={qrCode.image} alt={qrCode.description} className="w-16 h-16 object-cover" />
                            </TableCell>
                            <TableCell>{new Date(qrCode.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(qrCode.id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="transactionType">Transaction Type</Label>
                    <Select value={transactionType} onValueChange={setTransactionType}>
                      <SelectTrigger id="transactionType">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="withdraw">Withdraw</SelectItem>
                        <SelectItem value="earn">Earn</SelectItem>
                        <SelectItem value="spend">Spend</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="reward">Reward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="transactionStatus">Status</Label>
                    <Select value={transactionStatus} onValueChange={setTransactionStatus}>
                      <SelectTrigger id="transactionStatus">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDateStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDateStr}
                      onChange={(e) => setEndDateStr(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  <Button onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTransactions ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          No transactions available
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.user_name || transaction.user}</TableCell>
                          <TableCell>{transaction.transaction_type}</TableCell>
                          <TableCell>₹{formatAmount(transaction.amount)}</TableCell>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              transaction.status === 'verified' ? 'bg-blue-100 text-blue-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {transaction.article_title && (
                              <span className="text-sm text-gray-500">
                                {transaction.article_title}
                              </span>
                            )}
                            {transaction.description && (
                              <span className="text-sm text-gray-500 block">
                                {transaction.description}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Calculator Tab */}
        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>System Balance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading transaction summary...
                </div>
              ) : !transactionSummary ? (
                <div className="text-center py-8 text-muted-foreground">
                  Failed to load transaction summary
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Deposits</p>
                      <p className="text-xl font-bold">₹{transactionSummary.total_deposits.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                      <p className="text-xl font-bold">₹{transactionSummary.total_withdrawals.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-xl font-bold">₹{transactionSummary.total_earnings.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Spending</p>
                      <p className="text-xl font-bold">₹{transactionSummary.total_spending.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Rewards</p>
                      <p className="text-xl font-bold">₹{transactionSummary.total_rewards.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Wallet Balance</p>
                      <p className="text-xl font-bold">₹{transactionSummary.total_wallet_balance.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Reward Points</p>
                      <p className="text-xl font-bold">₹{transactionSummary.total_reward_points.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg col-span-1 md:col-span-2 lg:col-span-1">
                      <p className="text-sm text-muted-foreground">Transaction Counts</p>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Pending</p>
                          <p className="font-medium">{transactionSummary.transaction_counts.pending}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Approved</p>
                          <p className="font-medium">{transactionSummary.transaction_counts.approved}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rejected</p>
                          <p className="font-medium">{transactionSummary.transaction_counts.rejected}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Pending Payment Requests</p>
                      <p className="text-xl font-bold">{transactionSummary.pending_payment_requests}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">User Wallets</h3>
                    
                    <div className="mb-4">
                      <Input 
                        placeholder="Search by username" 
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Reward Points</TableHead>
                            <TableHead>Total Earnings</TableHead>
                            <TableHead>Total Spending</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingWallets ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                Loading wallets...
                              </TableCell>
                            </TableRow>
                          ) : wallets.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                No wallets available
                              </TableCell>
                            </TableRow>
                          ) : (
                            wallets.map((wallet) => (
                              <TableRow key={wallet.id}>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    {wallet.profile_photo && (
                                      <img 
                                        src={wallet.profile_photo} 
                                        alt={wallet.full_name || String(wallet.user)} 
                                        className="w-8 h-8 rounded-full"
                                      />
                                    )}
                                    <span>{wallet.full_name || wallet.user_name || String(wallet.user)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>₹{formatAmount(wallet.balance)}</TableCell>
                                <TableCell>₹{formatAmount(wallet.reward_points)}</TableCell>
                                <TableCell>₹{formatAmount(wallet.total_earning)}</TableCell>
                                <TableCell>₹{formatAmount(wallet.total_spending)}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    wallet.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                    wallet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {wallet.status}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* COMPLETELY REWRITTEN: Simple Load Balance Dialog without focus traps */}
      {showLoadBalanceDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Load User Balance</h2>
                <p className="text-sm text-muted-foreground">
                  Add balance or reward points to a user's wallet.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userSearch">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="userSearch"
                      placeholder="Search by username..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10"
                      autoComplete="off"
                    />
                  </div>
                  {isLoadingUsers && (
                    <p className="text-sm text-muted-foreground mt-1">Loading users...</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="userSelect">Select User</Label>
                  <Select 
                    value={selectedUserId} 
                    onValueChange={handleUserSelect}
                  >
                    <SelectTrigger id="userSelect">
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {filteredUsers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          {userSearch ? 'No users found' : 'Start typing to search users'}
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.full_name} (@{user.username})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="transactionTypeSelect">Transaction Type</Label>
                  <Select 
                    value={loadTransactionType} 
                    onValueChange={(value: 'deposit' | 'reward') => setLoadTransactionType(value)}
                  >
                    <SelectTrigger id="transactionTypeSelect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Add to Balance</SelectItem>
                      <SelectItem value="reward">Add to Reward Points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amountInput">Amount (₹)</Label>
                  <Input
                    id="amountInput"
                    type="number"
                    placeholder="Enter amount"
                    value={loadAmount}
                    onChange={(e) => setLoadAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    autoComplete="off"
                  />
                </div>
                
                <div>
                  <Label htmlFor="loadDescriptionInput">Description (Optional)</Label>
                  <Textarea
                    id="loadDescriptionInput"
                    placeholder="Enter a description for this transaction"
                    value={loadDescription}
                    onChange={(e) => setLoadDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseLoadBalanceDialog}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleLoadBalance} 
                  disabled={!selectedUserId || !loadAmount || isLoadingBalance}
                >
                  {isLoadingBalance ? 'Loading...' : 'Load Balance'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Request Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Payment Request</DialogTitle>
            <DialogDescription>
              Review the payment request details and provide an admin note if necessary.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p><strong>User:</strong> {selectedRequest.user_name}</p>
                <p><strong>Type:</strong> {selectedRequest.request_type}</p>
                <p><strong>Amount:</strong> ₹{formatAmount(selectedRequest.amount)}</p>
                <p><strong>Screenshot:</strong> <a href={selectedRequest.screenshot} target="_blank" rel="noopener noreferrer">View</a></p>
                {selectedRequest.qr_code && (
                  <div>
                    <p><strong>QR Code:</strong></p>
                    <img src={selectedRequest.qr_code.image} alt={selectedRequest.qr_code.description} className="w-32 h-32 object-contain mt-2" />
                    <span className="block text-sm text-muted-foreground">{selectedRequest.qr_code.description}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="adminNoteInput">Admin Note</Label>
                <Textarea
                  id="adminNoteInput"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Enter any notes about this action"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleAction('reject')}>
              Reject
            </Button>
            <Button onClick={() => handleAction('approve')}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}