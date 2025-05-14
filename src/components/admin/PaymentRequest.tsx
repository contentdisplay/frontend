import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import api from '@/services/api';

// Define the PaymentRequest interface
export interface PaymentRequest {
  id: string;
  user: number | string;
  user_name: string;
  request_type: 'deposit' | 'withdraw';
  amount: number;
  screenshot: string;
  qr_code?: { id: number; image: string; description: string; created_at: string };
  status: string;
  created_at: string;
  updated_at: string;
  admin_note?: string;
}

export default function AdminPaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      // Direct API call to the admin payment requests endpoint
      const response = await api.get('/wallet/admin/payment-requests/');
      const results = response.data.results || [];
      setRequests(results.map((req: any) => ({
        ...req,
        amount: typeof req.amount === 'string' ? parseFloat(req.amount) : req.amount
      })));
    } catch (error: any) {
      console.error('Error loading payment requests:', error);
      toast.error("Failed to load payment requests");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

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
      loadRequests();
    } catch (error: any) {
      console.error(`Failed to ${action} payment request:`, error);
      toast.error(`Failed to ${action} payment request: ${error.response?.data?.detail || error.message}`);
    }
  };

  const formatAmount = (amount: number | string | undefined): string => {
    if (typeof amount === 'undefined' || amount === null) return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Payment Requests</CardTitle>
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  Loading requests...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  No pending requests
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.user_name}</TableCell>
                  <TableCell>{request.request_type}</TableCell>
                  <TableCell>₹{formatAmount(request.amount)}</TableCell>
                  <TableCell>
                    <a href={request.screenshot} target="_blank" rel="noopener noreferrer">
                      <img src={request.screenshot} alt="Screenshot" className="w-16 h-16 object-cover" />
                    </a>
                  </TableCell>
                  <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

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
                    <img src={selectedRequest.qr_code.image} alt="QR Code" className="w-32 h-32 object-contain mt-2" />
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
    </Card>
  );
}