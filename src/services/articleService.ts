// services/articleService.ts
import api from './api';

export interface Article {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  thumbnail?: string;
  tags: string[];
  is_published: boolean;
  is_pending_publish: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  reward: number;
  normal_user_reads: number;
  word_count: number;
  likes_count: number;
  bookmarks_count: number;
  rewards_collected: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  status?: string;
  is_draft: boolean;
}

export interface ArticleLikeResponse {
  id: number;
  article: number;
  article_title: string;
  article_slug: string;
  user: string;
  created_at: string;
}

export interface ArticleBookmarkResponse {
  id: number;
  article: number;
  article_title: string;
  article_slug: string;
  user: string;
  created_at: string;
}

export interface ArticleAnalytics {
  title: string;
  slug: string;
  status: string;
  is_published: boolean;
  is_pending_publish: boolean;
  published_at: string | null;
  reads: number;
  likes: number;
  bookmarks: number;
  rewards_collected: number;
  total_earnings: number;
  word_count: number;
  reward: number;
  created_at: string;
}

export interface WriterAnalytics {
  total_articles: number;
  total_reads: number;
  total_likes: number;
  total_bookmarks: number;
  total_rewards_collected: number;
  total_earnings: number;
  status_counts: {
    draft: number;
    pending: number;
    published: number;
    rejected: number;
  };
  article_stats: ArticleAnalytics[];
}

export interface RewardCollectionResponse {
  detail: string;
  article: string;
  reward: number;
  multiplier: number;
}

export interface ArticleFormData {
  title: string;
  description: string;
  content: string;
  tags: string[];
  thumbnail?: File;
}

export interface PublishRequestResponse {
  detail: string;
  remaining_balance?: number;
  redirect_to_deposit?: boolean;
}

export interface ArticleStatusResponse {
  status: string;
  message: string;
  is_published: boolean;
  is_pending_publish: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  reads_count: number;
  likes_count: number;
  bookmarks_count: number;
  rewards_collected: number;
  total_earnings: number;
}

export interface CheckPublishBalanceResponse {
  current_balance: number;
  required_balance: number;
  has_sufficient_balance: boolean;
}

const articleService = {
  // Get all published articles
  getPublishedArticles: async () => {
    try {
      const response = await api.get('/articles/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch published articles:', error);
      return [];
    }
  },
  
  getArticleAnalytics: async (): Promise<ArticleAnalytics[]> => {
    try {
      // Ensure trailing slash for Django URL pattern compatibility
      const response = await api.get('/articles/writer/analytics/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch article analytics:', error);
      throw error;
    }
  },
  
  // Get comprehensive writer analytics
  getWriterAnalytics: async (): Promise<WriterAnalytics> => {
    try {
      // Ensure trailing slash for Django URL pattern compatibility
      const response = await api.get('/articles/writer-analytics/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch writer analytics:', error);
      throw error;
    }
  },

  // Get article by slug
  getArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await api.get(`/articles/${slug}/`);
    return response.data;
  },

  // Get all writer's articles
// Update the getAllWriterArticles method in articleService.ts

getAllWriterArticles: async (): Promise<Article[]> => {
  try {
    const response = await api.get('/articles/writer/articles/');
    
    // Handle paginated response
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    // Handle non-paginated response
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Failed to fetch writer articles:', error);
    throw error;
  }
},

  createArticle: async (data: ArticleFormData, isDraft: boolean = false): Promise<Article> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('content', data.content || '');
    
    // Add tags
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    } else {
      formData.append('tags', JSON.stringify([])); // Empty array to avoid backend validation errors
    }
  
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }
  
    formData.append('is_draft', isDraft ? 'true' : 'false');
  
    console.log("Sending to API:", Object.fromEntries(formData));
  
    try {
      const response = await api.post('/articles/create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error("Article creation error:", error);
      
      // Check for validation errors from the server
      if (error.response?.data) {
        console.error("Validation Errors:", error.response.data);
        
        // If this is a draft, handle validation errors differently
        if (isDraft) {
          // For drafts, try to submit with minimal data if server requires certain fields
          if (error.response.data.description || error.response.data.content) {
            try {
              // Create a new FormData with placeholder values for required fields
              const retryFormData = new FormData();
              retryFormData.append('title', data.title);
              retryFormData.append('description', data.description || 'Draft description');
              retryFormData.append('content', data.content || '<p>Draft content</p>');
              retryFormData.append('tags', JSON.stringify(data.tags || []));
              retryFormData.append('is_draft', 'true');
              
              if (data.thumbnail) {
                retryFormData.append('thumbnail', data.thumbnail);
              }
              
              // Try again with the adjusted data
              const retryResponse = await api.post('/articles/create/', retryFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              return retryResponse.data;
            } catch (retryError) {
              console.error("Retry failed:", retryError);
              // If retry fails, throw the original error
              throw new Error(JSON.stringify(error.response.data));
            }
          } else {
            throw new Error(JSON.stringify(error.response.data));
          }
        } else {
          throw new Error(JSON.stringify(error.response.data));
        }
      }
      throw error;
    }
  },

  // Update an existing article
  updateArticle: async (slug: string, data: ArticleFormData, isDraft: boolean = false): Promise<Article> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('content', data.content || '');
    
    // Add tags
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    } else {
      formData.append('tags', JSON.stringify([])); // Empty array to avoid backend validation errors
    }
    
    // Add a draft flag to indicate whether this is a draft update
    formData.append('is_draft', isDraft ? 'true' : 'false');
    
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }
    
    try {
      const response = await api.patch(`/articles/${slug}/update/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error("Article update error:", error);
      
      // Check for validation errors from the server
      if (error.response?.data) {
        console.error("Validation Errors:", error.response.data);
        
        // If this is a draft, handle validation errors differently
        if (isDraft) {
          // For drafts, try to submit with minimal data if server requires certain fields
          if (error.response.data.description || error.response.data.content) {
            try {
              // Create a new FormData with placeholder values for required fields
              const retryFormData = new FormData();
              retryFormData.append('title', data.title);
              retryFormData.append('description', data.description || 'Draft description');
              retryFormData.append('content', data.content || '<p>Draft content</p>');
              retryFormData.append('tags', JSON.stringify(data.tags || []));
              retryFormData.append('is_draft', 'true');
              
              if (data.thumbnail) {
                retryFormData.append('thumbnail', data.thumbnail);
              }
              
              // Try again with the adjusted data
              const retryResponse = await api.patch(`/articles/${slug}/update/`, retryFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              return retryResponse.data;
            } catch (retryError) {
              console.error("Retry failed:", retryError);
              // If retry fails, throw the original error
              throw new Error(JSON.stringify(error.response.data));
            }
          } else {
            throw new Error(JSON.stringify(error.response.data));
          }
        } else {
          throw new Error(JSON.stringify(error.response.data));
        }
      }
      throw error;
    }
  },

  // Delete an article
  deleteArticle: async (slug: string): Promise<void> => {
    await api.delete(`/articles/${slug}/delete/`);
  },

  // Request to publish an article
  requestPublish: async (slug: string): Promise<PublishRequestResponse> => {
    try {
      const response = await api.post(`/articles/request-publish/${slug}/`);
      return response.data;
    } catch (error: any) {
      console.error('Request publish error:', error.response?.data);
      
      // Handle insufficient balance and redirect to deposit
      if (error.response?.data?.redirect_to_deposit) {
        throw { 
          ...error.response.data, 
          redirect_to_deposit: true 
        };
      }
      
      throw error.response?.data || { detail: 'Failed to request publish' };
    }
  },

  // Collect reward for reading an article
  collectReward: async (slug: string, readingTimeSeconds: number): Promise<RewardCollectionResponse> => {
    try {
      const response = await api.post(`/articles/${slug}/collect-reward/`, {
        reading_time: readingTimeSeconds,
      });
      return response.data;
    } catch (error: any) {
      console.error('Collect reward error:', error.response?.data);
      throw error.response?.data || { detail: 'Failed to collect reward' };
    }
  },

  // Get pending articles for admin approval
  getPendingArticles: async () => {
    try {
      const response = await api.get('/articles/pending-publish/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending articles:', error);
      return [];
    }
  },

  // Approve an article for publishing (admin only)
  approveArticle: async (slug: string): Promise<{ detail: string }> => {
    const response = await api.post(`/articles/approve-publish/${slug}/`);
    return response.data;
  },

  // Reject an article for publishing (admin only)
  rejectArticle: async (slug: string, reason: string): Promise<{ detail: string }> => {
    const response = await api.post(`/articles/reject-publish/${slug}/`, { reason });
    return response.data;
  },

  // Toggle like status
  toggleLike: async (slug: string): Promise<ArticleLikeResponse | { detail: string }> => {
    const response = await api.post(`/articles/${slug}/like/`);
    return response.data;
  },

  // Check like status
  checkLikeStatus: async (slug: string): Promise<{ is_liked: boolean, likes_count: number }> => {
    const response = await api.get(`/articles/${slug}/like/`);
    return response.data;
  },

  // Get liked articles
  getLikedArticles: async (): Promise<ArticleLikeResponse[]> => {
    const response = await api.get('/articles/likes/');
    return response.data;
  },

  // Toggle bookmark status
  toggleBookmark: async (slug: string): Promise<ArticleBookmarkResponse | { detail: string }> => {
    const response = await api.post(`/articles/${slug}/bookmark/`);
    return response.data;
  },

  // Check bookmark status
  checkBookmarkStatus: async (slug: string): Promise<{ is_bookmarked: boolean, bookmarks_count: number }> => {
    const response = await api.get(`/articles/${slug}/bookmark/`);
    return response.data;
  },

  // Get bookmarked articles
  getBookmarkedArticles: async (): Promise<ArticleBookmarkResponse[]> => {
    const response = await api.get('/articles/bookmarks/');
    return response.data;
  },

  // Get trending articles
  getTrendingArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles/trending/');
    return response.data;
  },

  // Check article status
  checkArticleStatus: async (slug: string): Promise<ArticleStatusResponse> => {
    try {
      const response = await api.get(`/articles/${slug}/status/`);
      return response.data;
    } catch (error: any) {
      console.error('Check status error:', error.response?.data);
      throw error.response?.data || { status: 'error', message: 'Failed to check article status' };
    }
  },
  
  // Check if user has sufficient balance to publish
  checkPublishBalance: async (): Promise<CheckPublishBalanceResponse> => {
    try {
      const response = await api.get('/wallet/check-publish-balance/');
      return response.data;
    } catch (error: any) {
      console.error('Check publish balance error:', error.response?.data);
      throw error.response?.data || { 
        has_sufficient_balance: false, 
        current_balance: 0, 
        required_balance: 150 
      };
    }
  },
};

export default articleService;