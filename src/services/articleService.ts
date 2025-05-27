// services/articleService.ts
import api from './api';

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: number;
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

export interface ArticleReadingState {
  start_time: string;
  is_rewarded: boolean;
}
// Add this interface to your service
export interface GiftPointsRequest {
  recipient_id: number;
  amount: number;
  article_id: number;
  message?: string;
}

const articleService = {
  getPublishedArticles: async (page = 1, pageSize = 10): Promise<{results: Article[], count: number}> => {
    try {
        console.log('Calling getPublishedArticles API endpoint');
        const response = await api.get('/articles/', {
            params: {
                page,
                page_size: pageSize
            }
        });
        console.log('API Response from getPublishedArticles:', response);
        
        let articles: Article[] = [];
        let count = 0;
        
        if (Array.isArray(response.data)) {
            articles = response.data;
            count = response.data.length;
        } else if (response.data && typeof response.data === 'object') {
            if (Array.isArray(response.data.results)) {
                articles = response.data.results;
                count = response.data.count || articles.length;
            } else if (Array.isArray(response.data.data)) {
                articles = response.data.data;
                count = response.data.count || articles.length;
            }
        }
        
        return {
            results: articles.map(article => ({
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
                content: article.content || ''
            })),
            count
        };
    } catch (error) {
        console.error('Failed to fetch published articles:', error);
        return { results: [], count: 0 };
    }
},

  getTrendingArticles: async (): Promise<Article[]> => {
    try {
      // This is a placeholder - your API might have a dedicated endpoint for trending articles
      // or you might need to sort the results from getPublishedArticles by total_reads
      const response = await api.get('/articles/', {
        params: {
          sort_by: 'total_reads',
          limit: 3
        }
      });
      
      let articles: Article[] = [];
      
      if (Array.isArray(response.data)) {
        articles = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.results)) {
          articles = response.data.results;
        } else if (Array.isArray(response.data.data)) {
          articles = response.data.data;
        }
      }
      
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
        content: article.content || ''
      }));
    } catch (error) {
      console.error('Failed to fetch trending articles:', error);
      return [];
    }
  },

  getBookmarkedArticles: async (): Promise<{article: number}[]> => {
    try {
      const response = await api.get('/user/bookmarks/');
      console.log('Bookmarked articles response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Handle different possible response formats
        if (response.data.length > 0) {
          if (typeof response.data[0].article === 'number') {
            return response.data;
          } else if (response.data[0].article && typeof response.data[0].article.id === 'number') {
            return response.data.map(item => ({ article: item.article.id }));
          } else if (typeof response.data[0].id === 'number') {
            return response.data.map(item => ({ article: item.id }));
          }
        }
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch bookmarked articles:', error);
      return [];
    }
  },

  getLikedArticles: async (): Promise<{article: number}[]> => {
    try {
      // Get the user's liked articles
      const response = await api.get('/user/likes/');
      
      // If the API returns full article objects, map them to just the IDs
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length > 0 && typeof response.data[0].article === 'number') {
          return response.data;
        } else {
          // If the API returns full article objects
          return response.data.map((article: any) => ({ article: article.id }));
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch liked articles:', error);
      // Handle the 404 case by providing a fallback
      if ((error as any)?.response?.status === 404) {
        console.log('Likes endpoint not found, using local alternative');
        // If the API endpoint is not available, look up the articles with is_liked=true
        const articlesResponse = await api.get('/articles/');
        const articles = Array.isArray(articlesResponse.data) 
          ? articlesResponse.data 
          : (articlesResponse.data?.results || []);
          
        return articles
          .filter((article: Article) => article.is_liked)
          .map((article: Article) => ({ article: article.id }));
      }
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
    
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }
  
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }
    
    formData.append('status', isDraft ? 'draft' : 'pending');
  
    try {
      const response = await api.post('/articles/create/', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
      });
      console.log('Article created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error("Article creation error:", error);
      
      if (error.response?.data?.detail?.includes("Insufficient balance")) {
        error.redirect_to_deposit = true;
      }
      
      throw error;
    }
  },

  updateArticle: async (slug: string, data: ArticleFormData, isDraft: boolean = false): Promise<Article> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content || '');
    
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
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
      });
      console.log('Article updated:', response.data);
      return response.data;
    } catch (error) {
      console.error("Article update error:", error);
      throw error;
    }
  },

  deleteArticle: async (slug: string): Promise<void> => {
    try {
      await api.delete(`/articles/${slug}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      console.log('Article deleted:', slug);
    } catch (error) {
      console.error("Article deletion error:", error);
      throw error;
    }
  },

  // Updated to match backend API with article in request body
  toggleLike: async (articleId: number): Promise<any> => {
    try {
      const response = await api.post(`/articles/${articleId}/like/`, {
        article: articleId
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      console.log('Like toggled:', response.data);
      return response.data;
    } catch (error) {
      console.error("Like article error:", error);
      throw error;
    }
  },

  // Updated to match backend API with article in request body
  toggleBookmark: async (articleId: number): Promise<any> => {
    try {
      const response = await api.post(`/articles/${articleId}/bookmark/`, {
        article: articleId
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      console.log('Bookmark toggled:', response.data);
      return response.data;
    } catch (error) {
      console.error("Bookmark article error:", error);
      throw error;
    }
  },

  // New methods to match your backend API
  startReading: async (articleId: number): Promise<ArticleReadingState> => {
    try {
      const response = await api.post(`/articles/${articleId}/read/`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      console.log('Started reading article:', response.data);
      return response.data;
    } catch (error) {
      console.error("Start reading article error:", error);
      
      // If there's an error, provide a default reading state to avoid breaking the UI
      const defaultReadingState = {
        start_time: new Date().toISOString(),
        is_rewarded: false
      };
      
      // Check if article isn't published
      if ((error as any)?.response?.status === 400 && 
          (error as any)?.response?.data?.detail?.includes('Article not published')) {
        throw new Error('This article is not published and cannot be read at this time.');
      }
      
      return defaultReadingState;
    }
  },

  collectReward: async (articleId: number): Promise<any> => {
    try {
      const response = await api.post(`/articles/${articleId}/collect/`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      console.log('Reward collected:', response.data);
      return response.data;
    } catch (error) {
      console.error("Collect reward error:", error);
      
      const errorObj = error as any;
      const errorMessage = errorObj?.response?.data?.detail || 'Failed to collect reward';
      
      // Customize error messages for better user experience
      if (errorMessage.includes('Must read for at least 15 minutes')) {
        throw new Error('You need to read the article for the minimum required time to claim the reward.');
      } else if (errorMessage.includes('Reward already collected')) {
        throw new Error('You have already claimed the reward for this article.');
      }
      
      throw error;
    }
  },

  requestPublish: async (articleId: number): Promise<any> => {
    try {
      const response = await api.post(`/articles/${articleId}/request-publish/`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      console.log('Publish request submitted:', response.data);
      return response.data;
    } catch (error) {
      console.error("Publish request error:", error);
      throw error;
    }
  },

  checkPublishBalance: async (): Promise<WalletBalanceResponse> => {
    try {
      const response = await api.get('/wallet/view/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const walletData: WalletBalance = response.data;
      
      const currentBalance = parseFloat(walletData.balance || '0');
      const requiredBalance = 150;
      
      return {
        current_balance: currentBalance,
        required_balance: requiredBalance,
        has_sufficient_balance: currentBalance >= requiredBalance
      };
    } catch (error) {
      console.error("Check wallet balance error:", error);
      return {
        current_balance: 0,
        required_balance: 150,
        has_sufficient_balance: false
      };
    }
  },

  getWriterEarnings: async (): Promise<any> => {
    try {
      const response = await api.get('/writer/earnings/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      console.log('Writer earnings fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error("Get writer earnings error:", error);
      throw error;
    }
  },
  getArticleEarnings: async (articleId: number): Promise<any> => {
    try {
      const response = await api.get(`/articles/${articleId}/earnings/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch earnings for article ${articleId}:`, error);
      // Return default values if API fails
      return {
        points_earned: 0,
        uncollected_reads: 0,
        total_reads: 0
      };
    }
  },
  
  // Collect reward for an article
  // collectReward: async (articleId: number): Promise<any> => {
  //   try {
  //     const response = await api.post(`/articles/${articleId}/collect/`, {}, {
  //       headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
  //     });
  //     console.log('Reward collected:', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Collect reward error:", error);
      
  //     const errorObj = error as any;
  //     const errorMessage = errorObj?.response?.data?.detail || 'Failed to collect reward';
      
  //     // Customize error messages for better user experience
  //     if (errorMessage.includes('Must read for at least 15 minutes')) {
  //       throw new Error('You need to read the article for the minimum required time to claim the reward.');
  //     } else if (errorMessage.includes('Reward already collected')) {
  //       throw new Error('You have already claimed the reward for this article.');
  //     }
      
  //     throw error;
  //   }
  // },
  // collectArticleReward: async (articleId: number): Promise<any> => {
  //   try {
  //     const response = await api.post(`/articles/${articleId}/earnings/collect/`, {}, {
  //       headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
  //     });
  //     console.log('Article rewards collected:', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error(`Failed to collect rewards for article ${articleId}:`, error);
  //     throw error;
  //   }
  // },
  collectArticleReward: async (articleId: number): Promise<any> => {
  try {
    const response = await api.post(`/articles/${articleId}/earnings/collect/`, {}, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });
    console.log('Article rewards collected:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to collect rewards for article ${articleId}:`, error);
    throw error;
  }
},
};

export default articleService;