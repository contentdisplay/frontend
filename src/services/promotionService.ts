import api from './api';

interface PromotionResponse {
  detail: string;
}

const promotionService = {
  requestPromotion: async (): Promise<PromotionResponse> => {
    try {
      const response = await api.post('/auth/promotions/request/', {});
      return response.data;
    } catch (error: any) {
      console.error('Failed to request promotion:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to submit promotion request');
    }
  },
  getMyPromotionRequest: async (): Promise<any> => {
    try {
      const response = await api.get('/auth/promotions/my-request/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get promotion request:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to get promotion request');
    }
  },
};

export default promotionService;