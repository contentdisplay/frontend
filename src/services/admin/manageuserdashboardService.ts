// services/admin/manageuserdashboardService.ts
import api from '../api';
import { 
  Offer, 
  Promotion, 
  TopRewardEarner, 
  TopTransaction 
} from '../dashboardService';

const manageuserdashboardService = {
  // Offers CRUD
  getOffers: async (): Promise<Offer[]> => {
    try {
      const response = await api.get('/dashboard/offer/');
      
      // Check different possible response structures
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (response.data && typeof response.data === 'object') {
        // Handle case where response might be a single object
        return [response.data];
      }
      // Return empty array as fallback
      return [];
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return [];
    }
  },

  getOffer: async (id: string): Promise<Offer | null> => {
    try {
      const response = await api.get(`/dashboard/offers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch offer:', error);
      return null;
    }
  },

  createOffer: async (offer: Omit<Offer, 'id'>): Promise<Offer | null> => {
    try {
      // Prepare the data with proper formatting
      const offerData = {
        title: offer.title || '',
        description: offer.description || '',
        image: offer.image || '',
        reward_amount: Number(offer.reward_amount) || 0,
        redemption_link: offer.redemption_link || '',
        redemption_code: offer.redemption_code || '',
        expires_at: offer.expires_at,
        is_active: Boolean(offer.is_active)
      };

      console.log('Creating offer with data:', offerData);
      const response = await api.post('/dashboard/offer/', offerData);
      return response.data;
    } catch (error) {
      console.error('Failed to create offer:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error; // Re-throw to allow component to handle
    }
  },

  updateOffer: async (id: string, offer: Partial<Offer>): Promise<Offer | null> => {
    try {
      // Prepare the data with proper formatting
      const offerData = {
        ...offer,
        reward_amount: offer.reward_amount ? Number(offer.reward_amount) : undefined,
        is_active: offer.is_active !== undefined ? Boolean(offer.is_active) : undefined
      };

      const response = await api.put(`/dashboard/offers/${id}/`, offerData);
      return response.data;
    } catch (error) {
      console.error('Failed to update offer:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },

  deleteOffer: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/dashboard/offers/${id}/`);
      return true;
    } catch (error) {
      console.error('Failed to delete offer:', error);
      throw error;
    }
  },

  // Promotions CRUD
  getPromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get('/dashboard/promotion/');
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (response.data && typeof response.data === 'object') {
        return [response.data];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return [];
    }
  },

  getPromotion: async (id: string): Promise<Promotion | null> => {
    try {
      const response = await api.get(`/dashboard/promotions/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch promotion:', error);
      return null;
    }
  },

  createPromotion: async (promotion: Omit<Promotion, 'id'>): Promise<Promotion | null> => {
    try {
      // Prepare the data with proper formatting
      const promotionData = {
        title: promotion.title || '',
        description: promotion.description || '',
        image: promotion.image || '',
        link: promotion.link || '',
        start_date: promotion.start_date,
        end_date: promotion.end_date,
        priority: Number(promotion.priority) || 0,
        is_active: Boolean(promotion.is_active)
      };

      console.log('Creating promotion with data:', promotionData);
      const response = await api.post('/dashboard/promotion/', promotionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create promotion:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  },

  updatePromotion: async (id: string, promotion: Partial<Promotion>): Promise<Promotion | null> => {
    try {
      // Prepare the data with proper formatting
      const promotionData = {
        ...promotion,
        priority: promotion.priority ? Number(promotion.priority) : undefined,
        is_active: promotion.is_active !== undefined ? Boolean(promotion.is_active) : undefined
      };

      const response = await api.put(`/dashboard/promotions/${id}/`, promotionData);
      return response.data;
    } catch (error) {
      console.error('Failed to update promotion:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },

  deletePromotion: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/dashboard/promotions/${id}/`);
      return true;
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      throw error;
    }
  },

  // TopRewardEarner CRUD
  getTopRewardEarners: async (): Promise<TopRewardEarner[]> => {
    try {
      const response = await api.get('/dashboard/top-reward-earner/');
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (response.data && typeof response.data === 'object') {
        return [response.data];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch top reward earners:', error);
      return [];
    }
  },

  getTopRewardEarner: async (id: string): Promise<TopRewardEarner | null> => {
    try {
      const response = await api.get(`/dashboard/top-reward-earners/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top reward earner:', error);
      return null;
    }
  },

  createTopRewardEarner: async (earner: Omit<TopRewardEarner, 'id'>): Promise<TopRewardEarner | null> => {
    try {
      // Prepare the data with proper formatting
      const earnerData = {
        full_name: earner.full_name || '',
        username: earner.username || '',
        date: earner.date,
        total_rewards: Number(earner.total_rewards) || 0,
        rank: Number(earner.rank) || 1
      };

      const response = await api.post('/dashboard/top-reward-earner/', earnerData);
      return response.data;
    } catch (error) {
      console.error('Failed to create top reward earner:', error);
      throw error;
    }
  },

  updateTopRewardEarner: async (id: string, earner: Partial<TopRewardEarner>): Promise<TopRewardEarner | null> => {
    try {
      // Prepare the data with proper formatting
      const earnerData = {
        ...earner,
        total_rewards: earner.total_rewards ? Number(earner.total_rewards) : undefined,
        rank: earner.rank ? Number(earner.rank) : undefined
      };

      const response = await api.put(`/dashboard/top-reward-earners/${id}/`, earnerData);
      return response.data;
    } catch (error) {
      console.error('Failed to update top reward earner:', error);
      throw error;
    }
  },

  deleteTopRewardEarner: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/dashboard/top-reward-earners/${id}/`);
      return true;
    } catch (error) {
      console.error('Failed to delete top reward earner:', error);
      throw error;
    }
  },

  // TopTransaction CRUD
  getTopTransactions: async (): Promise<TopTransaction[]> => {
    try {
      const response = await api.get('/dashboard/top-transaction/');
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (response.data && typeof response.data === 'object') {
        return [response.data];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch top transactions:', error);
      return [];
    }
  },

  getTopTransaction: async (id: string): Promise<TopTransaction | null> => {
    try {
      const response = await api.get(`/dashboard/top-transactions/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top transaction:', error);
      return null;
    }
  },

  createTopTransaction: async (transaction: Omit<TopTransaction, 'id'>): Promise<TopTransaction | null> => {
    try {
      // Prepare the data with proper formatting
      const transactionData = {
        full_name: transaction.full_name || '',
        username: transaction.username || '',
        transaction_id: transaction.transaction_id || '',
        transaction_date: transaction.transaction_date,
        total_amount: Number(transaction.total_amount) || 0,
        amount_earned: Number(transaction.amount_earned) || 0,
        amount_spent: Number(transaction.amount_spent) || 0,
        amount_withdrawn: Number(transaction.amount_withdrawn) || 0,
        notes: transaction.notes || ''
      };

      const response = await api.post('/dashboard/top-transaction/', transactionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create top transaction:', error);
      throw error;
    }
  },

  updateTopTransaction: async (id: string, transaction: Partial<TopTransaction>): Promise<TopTransaction | null> => {
    try {
      // Prepare the data with proper formatting
      const transactionData = {
        ...transaction,
        total_amount: transaction.total_amount ? Number(transaction.total_amount) : undefined,
        amount_earned: transaction.amount_earned ? Number(transaction.amount_earned) : undefined,
        amount_spent: transaction.amount_spent ? Number(transaction.amount_spent) : undefined,
        amount_withdrawn: transaction.amount_withdrawn ? Number(transaction.amount_withdrawn) : undefined
      };

      const response = await api.put(`/dashboard/top-transactions/${id}/`, transactionData);
      return response.data;
    } catch (error) {
      console.error('Failed to update top transaction:', error);
      throw error;
    }
  },

  deleteTopTransaction: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/dashboard/top-transactions/${id}/`);
      return true;
    } catch (error) {
      console.error('Failed to delete top transaction:', error);
      throw error;
    }
  },
};

export default manageuserdashboardService;