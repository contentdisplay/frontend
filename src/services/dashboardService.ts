// dashboardService.ts
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
  is_claimed_today?: boolean; // If ANY offer was claimed today
  claimed_offer_today?: {     // Details of the offer claimed today
    id: string;
    title: string;
    reward_amount: number;
  } | null;
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

export interface ClaimResponse {
  message: string;
  reward_amount: number;
  new_reward_points: number;
  offer_title: string;
  next_claim_available: string;
}

const dashboardService = {
  getActiveOffers: async (): Promise<Offer[]> => {
    try {
      const response = await api.get('/dashboard/offers/');
      return response.data.results || response.data; // Handle paginated or non-paginated response
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      throw new Error('Failed to load active offers');
    }
  },

  getActivePromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get('/dashboard/promotions/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      throw new Error('Failed to load promotions');
    }
  },

  getTopRewardEarners: async (): Promise<TopRewardEarner[]> => {
    try {
      const response = await api.get('/dashboard/top-reward-earners/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Failed to fetch top reward earners:', error);
      throw new Error('Failed to load top reward earners');
    }
  },

  getTopTransactions: async (): Promise<TopTransaction[]> => {
    try {
      const response = await api.get('/dashboard/top-transactions/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Failed to fetch top transactions:', error);
      throw new Error('Failed to load top transactions');
    }
  },

  claimOffer: async (offerId: string): Promise<ClaimResponse> => {
    try {
      const response = await api.post(`/dashboard/offers/${offerId}/claim/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to claim offer. Please try again.');
    }
  },
};

export default dashboardService;