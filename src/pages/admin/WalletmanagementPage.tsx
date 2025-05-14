// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Textarea } from "@/components/ui/textarea";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import walletService, { PaymentRequest, QRCode, Transaction, WalletInfo } from '@/services/walletService';
// import { toast } from 'sonner';

// interface BalanceSummary {
//   totalDeposits: number;
//   totalWithdrawals: number;
//   totalEarnings: number;
//   totalSpending: number;
//   totalBalance: number;
// }

// export default function WalletQRManagement() {
//   const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
//   const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [wallets, setWallets] = useState<WalletInfo[]>([]);
//   const [isLoadingRequests, setIsLoadingRequests] = useState(true);
//   const [isLoadingQRCodes, setIsLoadingQRCodes] = useState(true);
//   const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
//   const [isLoadingWallets, setIsLoadingWallets] = useState(true);
//   const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
//   const [adminNote, setAdminNote] = useState('');
//   const [showActionDialog, setShowActionDialog] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const [description, setDescription] = useState('');
//   const [balanceSummary, setBalanceSummary] = useState<BalanceSummary>({
//     totalDeposits: 0,
//     totalWithdrawals: 0,
//     totalEarnings: 0,
//     totalSpending: 0,
//     totalBalance: 0,
//   });

//   useEffect(() => {
//     loadPaymentRequests();
//     loadQRCodes();
//     loadTransactions();
//     loadWallets();
//   }, []);

//   const loadPaymentRequests = async () => {
//     try {
//       setIsLoadingRequests(true);
//       const data = await walletService.getAdminPaymentRequests();
//       setPaymentRequests(data);
//     } catch (error) {
//       toast.error("Failed to load payment requests");
//     } finally {
//       setIsLoadingRequests(false);
//     }
//   };

//   const loadQRCodes = async () => {
//     try {
//       setIsLoadingQRCodes(true);
//       const data = await walletService.getQRCodes();
//       setQRCodes(data);
//     } catch (error) {
//       toast.error("Failed to load QR codes");
//     } finally {
//       setIsLoadingQRCodes(false);
//     }
//   };

//   const loadTransactions = async () => {
//     try {
//       setIsLoadingTransactions(true);
//       const data = await walletService.getTransactions();
//       setTransactions(data);
//       calculateBalanceSummary(data, wallets);
//     } catch (error) {
//       toast.error("Failed to load transactions");
//     } finally {
//       setIsLoadingTransactions(false);
//     }
//   };

//   const loadWallets = async () => {
//     try {
//       setIsLoadingWallets(true);
//       const response = await walletService.getWalletInfo();
//       setWallets([response]); // Assuming getWalletInfo can be extended to fetch all wallets for admin
//       calculateBalanceSummary(transactions, [response]);
//     } catch (error) {
//       toast.error("Failed to load wallet info");
//     } finally {
//       setIsLoadingWallets(false);
//     }
//   };

//   const calculateBalanceSummary = (txs: Transaction[], w: WalletInfo[]) => {
//     const summary: BalanceSummary = {
//       totalDeposits: 0,
//       totalWithdrawals: 0,
//       totalEarnings: 0,
//       totalSpending: 0,
//       totalBalance: 0,
//     };

//     txs.forEach((tx) => {
//       if (tx.status === 'approved') {
//         switch (tx.transaction_type) {
//           case 'deposit':
//             summary.totalDeposits += tx.amount;
//             break;
//           case 'withdraw':
//             summary.totalWithdrawals += tx.amount;
//             break;
//           case 'earn':
//             summary.totalEarnings += tx.amount;
//             break;
//           case 'spend':
//             summary.totalSpending += tx.amount;
//             break;
//         }
//       }
//     });

//     summary.totalBalance = w.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);

//     setBalanceSummary(summary);
//   };

//   const handleAction = async (action: 'approve' | 'reject') => {
//     if (!selectedRequest) return;

//     try {
//       await walletService.handleAdminPaymentRequestAction(selectedRequest.id, action, adminNote);
//       toast.success(`Payment request ${action}d successfully`);
//       setShowActionDialog(false);
//       setSelectedRequest(null);
//       setAdminNote('');
//       loadPaymentRequests();
//       loadTransactions();
//       loadWallets();
//     } catch (error) {
//       toast.error(`Failed to ${action} payment request`);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//     }
//   };

//   const handleUpload = async () => {
//     if (!file || !description) {
//       toast.error("Please select a file and provide a description");
//       return;
//     }

//     try {
//       await walletService.uploadQRCode(file, description);
//       toast.success("QR code uploaded successfully");
//       setFile(null);
//       setDescription('');
//       loadQRCodes();
//     } catch (error) {
//       toast.error("Failed to upload QR code");
//     }
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       await walletService.deleteQRCode(id);
//       toast.success("QR code deleted successfully");
//       loadQRCodes();
//     } catch (error) {
//       toast.error("Failed to delete QR code");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold">Manage Wallet & QR</h2>

//       <Tabs defaultValue="payments" className="w-full">
//         <TabsList className="grid grid-cols-3 w-[300px]">
//           <TabsTrigger value="payments">Payment Requests</TabsTrigger>
//           <TabsTrigger value="qr">QR Codes</TabsTrigger>
//           <TabsTrigger value="calculator">Balance Calculator</TabsTrigger>
//         </TabsList>

//         {/* Payment Requests Tab */}
//         <TabsContent value="payments">
//           <Card>
//             <CardHeader>
//               <CardTitle>Pending Payment Requests</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>User</TableHead>
//                     <TableHead>Type</TableHead>
//                     <TableHead>Amount</TableHead>
//                     <TableHead>Screenshot</TableHead>
//                     <TableHead>Created</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {isLoadingRequests ? (
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
//                         Loading requests...
//                       </TableCell>
//                     </TableRow>
//                   ) : paymentRequests.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
//                         No pending requests
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     paymentRequests.map((request) => (
//                       <TableRow key={request.id}>
//                         <TableCell>{request.user_name}</TableCell>
//                         <TableCell>{request.request_type}</TableCell>
//                         <TableCell>₹{request.amount.toFixed(2)}</TableCell>
//                         <TableCell>
//                           <a href={request.screenshot} target="_blank" rel="noopener noreferrer">
//                             <img src={request.screenshot} alt="Screenshot" className="w-16 h-16 object-cover" />
//                           </a>
//                         </TableCell>
//                         <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
//                         <TableCell>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => {
//                               setSelectedRequest(request);
//                               setShowActionDialog(true);
//                             }}
//                           >
//                             Review
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* QR Codes Tab */}
//         <TabsContent value="qr">
//           <Card>
//             <CardHeader>
//               <CardTitle>Manage QR Codes</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="qrCodeFile">Upload QR Code Image</Label>
//                   <Input
//                     id="qrCodeFile"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleFileChange}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="description">Description</Label>
//                   <Input
//                     id="description"
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     placeholder="Enter a description for the QR code"
//                   />
//                 </div>
//                 <Button onClick={handleUpload} disabled={!file || !description}>
//                   Upload QR Code
//                 </Button>
//               </div>

//               <div className="mt-6">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>ID</TableHead>
//                       <TableHead>Description</TableHead>
//                       <TableHead>Image</TableHead>
//                       <TableHead>Created</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {isLoadingQRCodes ? (
//                       <TableRow>
//                         <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
//                           Loading QR codes...
//                         </TableCell>
//                       </TableRow>
//                     ) : qrCodes.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
//                           No QR codes available
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       qrCodes.map((qrCode) => (
//                         <TableRow key={qrCode.id}>
//                           <TableCell>{qrCode.id}</TableCell>
//                           <TableCell>{qrCode.description}</TableCell>
//                           <TableCell>
//                             <img src={qrCode.image} alt={qrCode.description} className="w-16 h-16 object-cover" />
//                           </TableCell>
//                           <TableCell>{new Date(qrCode.created_at).toLocaleDateString()}</TableCell>
//                           <TableCell>
//                             <Button
//                               variant="destructive"
//                               size="sm"
//                               onClick={() => handleDelete(qrCode.id)}
//                             >
//                               Delete
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Balance Calculator Tab */}
//         <TabsContent value="calculator">
//           <Card>
//             <CardHeader>
//               <CardTitle>Balance Calculator</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
//                     <p className="text-sm text-muted-foreground">Total Deposits</p>
//                     <p className="text-xl font-bold">₹{balanceSummary.totalDeposits.toFixed(2)}</p>
//                   </div>
//                   <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
//                     <p className="text-sm text-muted-foreground">Total Withdrawals</p>
//                     <p className="text-xl font-bold">₹{balanceSummary.totalWithdrawals.toFixed(2)}</p>
//                   </div>
//                   <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
//                     <p className="text-sm text-muted-foreground">Total Earnings</p>
//                     <p className="text-xl font-bold">₹{balanceSummary.totalEarnings.toFixed(2)}</p>
//                   </div>
//                   <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
//                     <p className="text-sm text-muted-foreground">Total Spending</p>
//                     <p className="text-xl font-bold">₹{balanceSummary.totalSpending.toFixed(2)}</p>
//                   </div>
//                   <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg col-span-2">
//                     <p className="text-sm text-muted-foreground">Total User Balances</p>
//                     <p className="text-xl font-bold">₹{balanceSummary.totalBalance.toFixed(2)}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <h3 className="text-lg font-semibold">User Wallets</h3>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>User ID</TableHead>
//                       <TableHead>Balance</TableHead>
//                       <TableHead>Total Earnings</TableHead>
//                       <TableHead>Total Spending</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {isLoadingWallets ? (
//                       <TableRow>
//                         <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
//                           Loading wallets...
//                         </TableCell>
//                       </TableRow>
//                     ) : wallets.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
//                           No wallets available
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       wallets.map((wallet) => (
//                         <TableRow key={wallet.id}>
//                           <TableCell>{wallet.user}</TableCell>
//                           <TableCell>₹{wallet.balance.toFixed(2)}</TableCell>
//                           <TableCell>₹{wallet.total_earning.toFixed(2)}</TableCell>
//                           <TableCell>₹{wallet.total_spending.toFixed(2)}</TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Review Payment Request Dialog */}
//       <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Review Payment Request</DialogTitle>
//             <DialogDescription>
//               Review the payment request details and provide an admin note if necessary.
//             </DialogDescription>
//           </DialogHeader>
//           {selectedRequest && (
//             <div className="space-y-4">
//               <div>
//                 <p><strong>User:</strong> {selectedRequest.user_name}</p>
//                 <p><strong>Type:</strong> {selectedRequest.request_type}</p>
//                 <p><strong>Amount:</strong> ₹{selectedRequest.amount.toFixed(2)}</p>
//                 <p><strong>Screenshot:</strong> <a href={selectedRequest.screenshot} target="_blank" rel="noopener noreferrer">View</a></p>
//                 {selectedRequest.qr_code && (
//                   <p><strong>QR Code:</strong> <img src={selectedRequest.qr_code.image} alt="QR Code" className="w-16 h-16 inline-block" /></p>
//                 )}
//               </div>
//               <div>
//                 <Label htmlFor="adminNote">Admin Note</Label>
//                 <Textarea
//                   id="adminNote"
//                   value={adminNote}
//                   onChange={(e) => setAdminNote(e.target.value)}
//                   placeholder="Enter any notes about this action"
//                 />
//               </div>
//             </div>
//           )}
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowActionDialog(false)}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={() => handleAction('reject')}>
//               Reject
//             </Button>
//             <Button onClick={() => handleAction('approve')}>
//               Approve
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }