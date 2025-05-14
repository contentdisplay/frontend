import api from './api';

export interface WalletInfo {
  id: string;
  balance: number;
  total_earning: number;
  total_spending: number;
  user: string | number;
  status?: string;
}

export interface Transaction {
  id: string;
  user: number | string;
  transaction_type: 'deposit' | 'withdraw' | 'earn' | 'spend' | 'refund';
  article_title?: string;
  amount: number;
  date: string;
  status?: string;
}

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

export interface QRCode {
  id: number;
  image: string;
  description: string;
  created_at: string;
}

const walletService = {
  getWalletInfo: async (filter?: string): Promise<WalletInfo> => {
    try {
      const response = await api.get('/wallet/view/');
      const data = response.data;
      return {
        ...data,
        balance: typeof data.balance === 'string' ? parseFloat(data.balance) : data.balance,
        total_earning: typeof data.total_earning === 'string' ? parseFloat(data.total_earning) : data.total_earning,
        total_spending: typeof data.total_spending === 'string' ? parseFloat(data.total_spending) : data.total_spending,
      };
    } catch (error: any) {
      console.error('Wallet info error:', error.message, error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch wallet info');
    }
  },

  getTransactions: async (filter?: string): Promise<Transaction[]> => {
    try {
      const endpoint = filter ? `/wallet/transactions/?filter=${filter}` : '/wallet/transactions/';
      const response = await api.get(endpoint);
      return response.data.map((tx: any) => ({
        ...tx,
        amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
      }));
    } catch (error: any) {
      console.error('Transactions error:', error.message, error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch transactions');
    }
  },

  initiatePaymentRequest: async (): Promise<QRCode> => {
    try {
      const response = await api.get('/wallet/payment-request/initiate/');
      return response.data;
    } catch (error: any) {
      console.error('Initiate payment request error:', error.message, error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to initiate payment request');
    }
  },

  createPaymentRequest: async (
    request_type: 'deposit' | 'withdraw',
    amount: number,
    file: File
  ): Promise<PaymentRequest> => {
    try {
      const formData = new FormData();
      formData.append('request_type', request_type);
      formData.append('amount', amount.toString());
      formData.append('screenshot', file);
      const response = await api.post('/wallet/payment-request/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        ...response.data,
        amount: typeof response.data.amount === 'string' ? parseFloat(response.data.amount) : response.data.amount
      };
    } catch (error: any) {
      console.error('Payment request error:', error.message, error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to create payment request');
    }
  },

  getAdminPaymentRequests: async (): Promise<PaymentRequest[]> => {
    try {
      const response = await api.get('/wallet/admin/payment-requests/');
      const results = response.data.results || [];
      return results.map((req: any) => ({
        ...req,
        amount: typeof req.amount === 'string' ? parseFloat(req.amount) : req.amount
      }));
    } catch (error: any) {
      console.error('Admin payment requests error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      const errorMessage = error.response?.status === 401
        ? 'Unauthorized: Please log in as an admin'
        : error.response?.data?.detail || 'Failed to fetch payment requests';
      throw new Error(errorMessage);
    }
  },

  handleAdminPaymentRequestAction: async (
    requestId: string,
    action: 'approve' | 'reject',
    adminNote?: string
  ): Promise<void> => {
    try {
      await api.post(`/wallet/admin/payment-requests/${requestId}/action/`, {
        action,
        admin_note: adminNote || ''
      });
    } catch (error: any) {
      console.error('Admin payment request action error:', error.message, error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to process payment request');
    }
  },

  uploadQRCode: async (file: File, description: string): Promise<QRCode> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('description', description);
      const response = await api.post('/wallet/admin/qr-codes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error: any) {
      console.error('QR code upload error:', error.message, error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to upload QR code');
    }
  },

  getQRCodes: async (): Promise<QRCode[]> => {
    try {
      const response = await api.get('/wallet/admin/qr-codes/');
      return response.data.results || [];
    } catch (error: any) {
      console.error('QR codes fetch error:', error.message, error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch QR codes');
    }
  },

  deleteQRCode: async (id: number): Promise<void> => {
    try {
      await api.delete(`/wallet/admin/qr-codes/${id}/`);
    } catch (error: any) {
      console.error('QR code delete error:', error.message, error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to delete QR code');
    }
  },
};

export default walletService;