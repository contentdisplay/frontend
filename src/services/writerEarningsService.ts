// services/writerEarningsService.ts
import api from './api';

export interface WriterEarningsData {
  total_points_earned: number;
  articles: {
    id: number;
    title: string;
    points_earned: number;
    uncollected_reads: number;
    total_reads: number;
  }[];
}

export interface RewardCollectionResponse {
  success: boolean;
  points_collected: number;
  total_points_earned: number;
  message: string;
}

const writerEarningsService = {
  /**
   * Get all earnings for the current writer
   */
  getWriterEarnings: async (): Promise<WriterEarningsData> => {
    try {
      const response = await api.get('/writer/earnings/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch writer earnings:", error);
      // Return default structure if API fails
      return {
        total_points_earned: 0,
        articles: []
      };
    }
  },

  /**
   * Get earnings for a specific article
   */
  getArticleEarnings: async (articleId: number): Promise<{
    points_earned: number;
    uncollected_reads: number;
    total_reads: number;
  }> => {
    try {
      const response = await api.get(`/writer/earnings/article/${articleId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch earnings for article ${articleId}:`, error);
      return {
        points_earned: 0,
        uncollected_reads: 0,
        total_reads: 0
      };
    }
  },

  /**
   * Collect rewards for a specific article
   */
  collectRewards: async (articleId: number): Promise<RewardCollectionResponse> => {
    try {
      const response = await api.post(`/writer/earnings/collect/${articleId}/`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      return response.data;
    } catch (error: any) {
      console.error(`Failed to collect rewards for article ${articleId}:`, error);
      
      // Handle common errors
      const errorMessage = error.response?.data?.detail || 'Failed to collect rewards';
      throw new Error(errorMessage);
    }
  }
};

export default writerEarningsService;