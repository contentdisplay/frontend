// services/walletService.ts
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

const walletService = {
  getWalletInfo: async (filter?: string): Promise<WalletInfo> => {
    try {
      const response = await api.get('/wallet/view/');
      const data = response.data;
      
      // Ensure numeric values
      return {
        ...data,
        balance: typeof data.balance === 'string' ? parseFloat(data.balance) : data.balance,
        total_earning: typeof data.total_earning === 'string' ? parseFloat(data.total_earning) : data.total_earning,
        total_spending: typeof data.total_spending === 'string' ? parseFloat(data.total_spending) : data.total_spending,
      };
    } catch (error: any) {
      console.error('Wallet info error:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch wallet info');
    }
  },

  getTransactions: async (filter?: string): Promise<Transaction[]> => {
    try {
      const endpoint = filter 
        ? `/wallet/transactions/?filter=${filter}` 
        : '/wallet/transactions/';
      
      const response = await api.get(endpoint);
      
      // Ensure numeric amounts
      return response.data.map((tx: any) => ({
        ...tx,
        amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
      }));
    } catch (error: any) {
      console.error('Transactions error:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch transactions');
    }
  },
};

export default walletService;