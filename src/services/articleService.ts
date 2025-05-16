// Updated checkPublishBalance function for articleService.ts
import api from './api';

export interface Article {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content: string;
  author: string;
  author_name: string;
  thumbnail?: string;
  tags: string[];
  status: string;
  total_reads: number;
  total_likes: number;
  total_bookmarks: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  likes_count?: number;
  bookmarks_count?: number;
  word_count?: number;
  reward?: number;
  is_published?: boolean;
  is_pending_publish?: boolean;
}

export interface ArticleFormData {
  title: string;
  content: string;
  description?: string;
  tags?: string[];
  thumbnail?: File;
  status?: string;
}

export interface WalletBalance {
  id: string;
  balance: string;
  reward_points: string;
  total_earning: string;
  total_spending: string;
  status: string;
  full_name?: string;
  profile_photo?: string;
  user_name?: string;
  user_id?: string;
}

export interface WalletBalanceResponse {
  current_balance: number;
  required_balance: number;
  has_sufficient_balance: boolean;
}

const articleService = {
  getPublishedArticles: async (): Promise<Article[]> => {
    try {
      console.log('Calling getPublishedArticles API endpoint');
      const response = await api.get('/articles/');
      console.log('API Response from getPublishedArticles:', response);
      
      // Handle different response formats
      let articles: Article[] = [];
      
      if (Array.isArray(response.data)) {
        // Direct array response
        articles = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Paginated response with results array
        if (Array.isArray(response.data.results)) {
          articles = response.data.results;
        } else if (Array.isArray(response.data.data)) {
          // Some APIs use "data" instead of "results"
          articles = response.data.data;
        }
      }
      
      // Transform each article to ensure consistent properties
      return articles.map(article => ({
        ...article,
        likes_count: article.total_likes || 0,
        bookmarks_count: article.total_bookmarks || 0,
        is_bookmarked: article.is_bookmarked || false,
        is_liked: article.is_liked || false,
        tags: article.tags || [],
        reward: article.reward || 0,
        word_count: article.word_count || 0,
        is_published: article.status === 'published',
        is_pending_publish: article.status === 'pending',
        description: article.description || ''
      }));
    } catch (error) {
      console.error('Failed to fetch published articles:', error);
      return [];
    }
  },

  getArticleBySlug: async (slug: string): Promise<Article> => {
    try {
      const response = await api.get(`/articles/${slug}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch article with slug ${slug}:`, error);
      throw error;
    }
  },

  createArticle: async (data: ArticleFormData, isDraft: boolean = false): Promise<Article> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content || '');
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }
  
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }
    
    // Always set status field
    formData.append('status', isDraft ? 'draft' : 'pending');
  
    try {
      const response = await api.post('/articles/create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error("Article creation error:", error);
      
      // Check if the error is due to insufficient balance
      if (error.response?.data?.detail?.includes("Insufficient reward points")) {
        error.redirect_to_deposit = true;
      }
      
      throw error;
    }
},

  updateArticle: async (slug: string, data: ArticleFormData, isDraft: boolean = false): Promise<Article> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content || '');
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }
    
    if (isDraft) {
      formData.append('status', 'draft');
    } else if (data.status) {
      formData.append('status', data.status);
    }
    
    try {
      const response = await api.patch(`/articles/${slug}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error("Article update error:", error);
      throw error;
    }
  },

  deleteArticle: async (slug: string): Promise<void> => {
    try {
      await api.delete(`/articles/${slug}/`);
    } catch (error) {
      console.error("Article deletion error:", error);
      throw error;
    }
  },

  toggleLike: async (slug: string): Promise<any> => {
    try {
      const response = await api.post(`/articles/${slug}/like/`);
      return response.data;
    } catch (error) {
      console.error("Like article error:", error);
      throw error;
    }
  },

  toggleBookmark: async (slug: string): Promise<any> => {
    try {
      const response = await api.post(`/articles/${slug}/bookmark/`);
      return response.data;
    } catch (error) {
      console.error("Bookmark article error:", error);
      throw error;
    }
  },

  requestPublish: async (slug: string): Promise<any> => {
    try {
      const response = await api.post(`/articles/${slug}/request-publish/`);
      return response.data;
    } catch (error) {
      console.error("Publish request error:", error);
      throw error;
    }
  },

  // Updated checkPublishBalance to match your actual wallet API
  checkPublishBalance: async (): Promise<WalletBalanceResponse> => {
    try {
      const response = await api.get('/wallet/view/');
      const walletData: WalletBalance = response.data;
      
      // Parse the balance string to a number
      const currentBalance = parseFloat(walletData.balance || '0');
      const requiredBalance = 150; // The fixed requirement from your backend
      
      return {
        current_balance: currentBalance,
        required_balance: requiredBalance,
        has_sufficient_balance: currentBalance >= requiredBalance
      };
    } catch (error) {
      console.error("Check wallet balance error:", error);
      // Return default values if API call fails
      return {
        current_balance: 0,
        required_balance: 150,
        has_sufficient_balance: false
      };
    }
  },

  getWriterEarnings: async (): Promise<any> => {
    try {
      const response = await api.get('/writer/earnings/');
      return response.data;
    } catch (error) {
      console.error("Get writer earnings error:", error);
      throw error;
    }
  }
};

export default articleService;