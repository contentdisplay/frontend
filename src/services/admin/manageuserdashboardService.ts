// services/admin/adminDashboardService.ts
import api from '../api';
import { 
  Offer, 
  Promotion, 
  TopRewardEarner, 
  TopTransaction 
} from '../dashboardService';

const manageuserdashboardService = {
  // Offers CRUD
// In adminDashboardService.ts
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
      const response = await api.post('/dashboard/offer/', offer);
      return response.data;
    } catch (error) {
      console.error('Failed to create offer:', error);
      return null;
    }
  },

  updateOffer: async (id: string, offer: Partial<Offer>): Promise<Offer | null> => {
    try {
      const response = await api.put(`/dashboard/offers/${id}/`, offer);
      return response.data;
    } catch (error) {
      console.error('Failed to update offer:', error);
      return null;
    }
  },

  deleteOffer: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/dashboard/offers/${id}/`);
      return true;
    } catch (error) {
      console.error('Failed to delete offer:', error);
      return false;
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
        // Handle case where response might be a single object
        return [response.data];
      }
      // Return empty array as fallback
      return [];
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
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
      const response = await api.post('/dashboard/promotion/', promotion);
      return response.data;
    } catch (error) {
      console.error('Failed to create promotion:', error);
      return null;
    }
  },

  updatePromotion: async (id: string, promotion: Partial<Promotion>): Promise<Promotion | null> => {
    try {
      const response = await api.put(`/dashboard/promotions/${id}/`, promotion);
      return response.data;
    } catch (error) {
      console.error('Failed to update promotion:', error);
      return null;
    }
  },

  deletePromotion: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/dashboard/promotions/${id}/`);
      return true;
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      return false;
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
        // Handle case where response might be a single object
        return [response.data];
      }
      // Return empty array as fallback
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
      const response = await api.post('/dashboard/top-reward-earner/', earner);
      return response.data;
    } catch (error) {
      console.error('Failed to create top reward earner:', error);
      return null;
    }
  },

  updateTopRewardEarner: async (id: string, earner: Partial<TopRewardEarner>): Promise<TopRewardEarner | null> => {
    try {
      const response = await api.put(`/dashboard/top-reward-earners/${id}/`, earner);
      return response.data;
    } catch (error) {
      console.error('Failed to update top reward earner:', error);
      return null;
    }
  },

  deleteTopRewardEarner: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/dashboard/top-reward-earners/${id}/`);
      return true;
    } catch (error) {
      console.error('Failed to delete top reward earner:', error);
      return false;
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
        // Handle case where response might be a single object
        return [response.data];
      }
      // Return empty array as fallback
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
      const response = await api.post('/dashboard/top-transaction/', transaction);
      return response.data;
    } catch (error) {
      console.error('Failed to create top transaction:', error);
      return null;
    }
  },

  updateTopTransaction: async (id: string, transaction: Partial<TopTransaction>): Promise<TopTransaction | null> => {
    try {
      const response = await api.put(`/dashboard/top-transactions/${id}/`, transaction);
      return response.data;
    } catch (error) {
      console.error('Failed to update top transaction:', error);
      return null;
    }
  },

  deleteTopTransaction: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/dashboard/top-transactions/${id}/`);
      return true;
    } catch (error) {
      console.error('Failed to delete top transaction:', error);
      return false;
    }
  },
};

export default manageuserdashboardService;