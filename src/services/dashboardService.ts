import api from './api';

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  redemption_link: string;
  reward_amount: number;
  redemption_code?: string;
  expires_at: string;
  is_active: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  start_date: string;
  end_date: string;
  priority: number;
  is_active: boolean;
}

export interface TopRewardEarner {
  id: string;
  full_name: string;
  username: string;
  date: string;
  total_rewards: number;
  rank: number;
}

export interface TopTransaction {
  id: string;
  full_name: string;
  username: string;
  transaction_id: string;
  transaction_date: string;
  total_amount: number;
  amount_earned: number;
  amount_spent: number;
  amount_withdrawn: number;
  notes: string;
}

const dashboardService = {
  getActiveOffers: async (): Promise<Offer[]> => {
    try {
      const response = await api.get('/dashboard/offers/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      return [];
    }
  },

  getActivePromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get('/dashboard/promotions/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      return [];
    }
  },

  getTopRewardEarners: async (): Promise<TopRewardEarner[]> => {
    try {
      const response = await api.get('/dashboard/top-reward-earners/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top reward earners:', error);
      return [];
    }
  },

  getTopTransactions: async (): Promise<TopTransaction[]> => {
    try {
      const response = await api.get('/dashboard/top-transactions/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top transactions:', error);
      return [];
    }
  },
};

export default dashboardService;
