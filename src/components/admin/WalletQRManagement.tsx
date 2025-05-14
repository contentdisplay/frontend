import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import walletService from '@/services/walletService';
import { toast } from 'sonner';
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
  transaction_type: 'deposit' | 'withdraw' | 'earn' | 'spend' | 'refund';
  article_title?: string;
  amount: number | string;
  date: string;
  status?: string;
}

interface WalletInfo {
  id: string;
  balance: number | string;
  total_earning: number | string;
  total_spending: number | string;
  user: string | number;
  status?: string;
}

interface BalanceSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalEarnings: number;
  totalSpending: number;
  totalBalance: number;
}

export default function WalletQRManagement() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingQRCodes, setIsLoadingQRCodes] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalEarnings: 0,
    totalSpending: 0,
    totalBalance: 0,
  });

  useEffect(() => {
    loadPaymentRequests();
    loadQRCodes();
    loadTransactions();
    loadWallets();
  }, []);

  const loadPaymentRequests = async () => {
    try {
      setIsLoadingRequests(true);
      // Direct API call to get admin payment requests
      const response = await api.get('/wallet/admin/payment-requests/');
      
      // Debug logs to see what's coming from the API
      console.log('Raw API response:', response);
      
      // Handle both direct array and paginated responses with 'results' field
      const results = Array.isArray(response.data) ? response.data : (response.data.results || []);
      console.log('Payment Requests loaded:', results);
      
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
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error("Failed to load payment requests");
      setPaymentRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const loadQRCodes = async () => {
    try {
      setIsLoadingQRCodes(true);
      const response = await api.get('/wallet/admin/qr-codes/');
      const results = Array.isArray(response.data) ? response.data : (response.data.results || []);
      console.log('QR Codes loaded:', results);
      setQRCodes(results);
    } catch (error: any) {
      console.error('Error loading QR codes:', error);
      toast.error("Failed to load QR codes");
      setQRCodes([]);
    } finally {
      setIsLoadingQRCodes(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const response = await api.get('/wallet/transactions/');
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      
      const formattedTransactions = data.map((tx: any) => ({
        ...tx,
        amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
      }));
      
      setTransactions(formattedTransactions);
      calculateBalanceSummary(formattedTransactions, wallets);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      toast.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const loadWallets = async () => {
    try {
      setIsLoadingWallets(true);
      const response = await api.get('/wallet/view/');
      const walletData = response.data;
      
      const formattedWallet = {
        ...walletData,
        balance: typeof walletData.balance === 'string' ? parseFloat(walletData.balance) : walletData.balance,
        total_earning: typeof walletData.total_earning === 'string' ? parseFloat(walletData.total_earning) : walletData.total_earning,
        total_spending: typeof walletData.total_spending === 'string' ? parseFloat(walletData.total_spending) : walletData.total_spending,
      };
      
      setWallets([formattedWallet]);
      calculateBalanceSummary(transactions, [formattedWallet]);
    } catch (error: any) {
      console.error('Error loading wallet info:', error);
      toast.error("Failed to load wallet info");
      setWallets([]);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  const calculateBalanceSummary = (txs: Transaction[], w: WalletInfo[]) => {
    const summary: BalanceSummary = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalEarnings: 0,
      totalSpending: 0,
      totalBalance: 0,
    };

    txs.forEach((tx) => {
      if (tx.status === 'approved') {
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        
        switch (tx.transaction_type) {
          case 'deposit':
            summary.totalDeposits += amount;
            break;
          case 'withdraw':
            summary.totalWithdrawals += amount;
            break;
          case 'earn':
            summary.totalEarnings += amount;
            break;
          case 'spend':
            summary.totalSpending += amount;
            break;
        }
      }
    });

    summary.totalBalance = w.reduce((sum, wallet) => {
      const balance = typeof wallet.balance === 'string' ? parseFloat(wallet.balance) : (wallet.balance || 0);
      return sum + balance;
    }, 0);

    setBalanceSummary(summary);
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    try {
      // Direct API call for payment request action
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
      loadTransactions();
      loadWallets();
    } catch (error: any) {
      console.error(`Failed to ${action} payment request:`, error);
      toast.error(`Failed to ${action} payment request: ${error.response?.data?.detail || error.message}`);
    }
  };

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

  const formatAmount = (amount: number | string | undefined): string => {
    if (typeof amount === 'undefined' || amount === null) return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Wallet & QR</h2>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid grid-cols-4 w-[400px]">
          <TabsTrigger value="payments">Payment Requests</TabsTrigger>
          <TabsTrigger value="qr">QR Codes</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="calculator">Balance Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Requests</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
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
                        <TableCell>{transaction.user}</TableCell>
                        <TableCell>{transaction.transaction_type}</TableCell>
                        <TableCell>₹{formatAmount(transaction.amount)}</TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            transaction.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
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
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>Balance Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Deposits</p>
                    <p className="text-xl font-bold">₹{balanceSummary.totalDeposits.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                    <p className="text-xl font-bold">₹{balanceSummary.totalWithdrawals.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-xl font-bold">₹{balanceSummary.totalEarnings.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Spending</p>
                    <p className="text-xl font-bold">₹{balanceSummary.totalSpending.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg col-span-2">
                    <p className="text-sm text-muted-foreground">Total User Balances</p>
                    <p className="text-xl font-bold">₹{balanceSummary.totalBalance.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold">User Wallets</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Total Spending</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingWallets ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                          Loading wallets...
                        </TableCell>
                      </TableRow>
                    ) : wallets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                          No wallets available
                        </TableCell>
                      </TableRow>
                    ) : (
                      wallets.map((wallet) => (
                        <TableRow key={wallet.id}>
                          <TableCell>{wallet.user}</TableCell>
                          <TableCell>₹{formatAmount(wallet.balance)}</TableCell>
                          <TableCell>₹{formatAmount(wallet.total_earning)}</TableCell>
                          <TableCell>₹{formatAmount(wallet.total_spending)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                  <p>
                    <strong>QR Code:</strong>
                    <img src={selectedRequest.qr_code.image} alt={selectedRequest.qr_code.description} className="w-32 h-32 object-contain mt-2" />
                    <span>{selectedRequest.qr_code.description}</span>
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="adminNote">Admin Note</Label>
                <Textarea
                  id="adminNote"
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