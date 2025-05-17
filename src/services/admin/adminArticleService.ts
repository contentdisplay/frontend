import api from '../api';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: number;
  author_name: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
  published_at: string | null;
  thumbnail?: string | null;
  total_reads: number;
  total_likes: number;
  likes_count: number;
  bookmarks_count: number;
  word_count: number;
  tags?: string[];
}

interface AdminArticleResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Article[];
}

const adminArticleService = {
  // Get all articles with optional status filter
  getAllArticles: async (status?: string): Promise<Article[]> => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/admin/articles/', { params });
      
      // Handle response format
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching admin articles:', error);
      throw error;
    }
  },
  
  // Get pending articles awaiting approval
  getPendingArticles: async (): Promise<Article[]> => {
    try {
      const response = await api.get('/admin/articles/pending/');
      return Array.isArray(response.data) ? response.data : 
             (response.data && response.data.results ? response.data.results : []);
    } catch (error) {
      console.error('Error fetching pending articles:', error);
      throw error;
    }
  },
  
  // Get a specific article details
  getArticleDetails: async (id: number): Promise<Article> => {
    try {
      const response = await api.get(`/admin/articles/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      throw error;
    }
  },
  
  // Update an article (including status changes)
  updateArticle: async (id: number, articleData: Partial<Article>): Promise<Article> => {
    try {
      const response = await api.put(`/admin/articles/${id}/update/`, articleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating article ${id}:`, error);
      throw error;
    }
  },
  
  // Update only an article's status
  updateArticleStatus: async (id: number, status: 'draft' | 'pending' | 'published' | 'rejected'): Promise<Article> => {
    try {
      const response = await api.patch(`/admin/articles/${id}/update/`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating article ${id} status:`, error);
      throw error;
    }
  },
  
  // Approve an article for publishing
  approveArticle: async (id: number): Promise<void> => {
    try {
      await api.post(`/admin/articles/${id}/approve/`);
    } catch (error) {
      console.error(`Error approving article ${id}:`, error);
      throw error;
    }
  },
  
  // Reject an article
  rejectArticle: async (id: number, feedback?: string): Promise<Article> => {
    try {
      const response = await api.patch(`/admin/articles/${id}/update/`, { 
        status: 'rejected',
        admin_feedback: feedback
      });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting article ${id}:`, error);
      throw error;
    }
  },
  
  // Add feedback to an article
  addFeedback: async (id: number, feedback: string): Promise<void> => {
    try {
      await api.post(`/admin/articles/${id}/feedback/`, { feedback });
    } catch (error) {
      console.error(`Error adding feedback to article ${id}:`, error);
      throw error;
    }
  },
  
  // Delete an article
  deleteArticle: async (id: number): Promise<void> => {
    try {
      await api.delete(`/admin/articles/${id}/delete/`);
    } catch (error) {
      console.error(`Error deleting article ${id}:`, error);
      throw error;
    }
  },
  
  // Get article statistics
  getArticleStats: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/articles/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching article statistics:', error);
      throw error;
    }
  }
};

export default adminArticleService;