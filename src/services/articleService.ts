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
}

export interface ArticleLikeResponse {
  id: number;
  article: number;
  article_title: string;
  article_slug: string;
  created_at: string;
}

export interface ArticleBookmarkResponse {
  id: number;
  article: number;
  article_title: string;
  article_slug: string;
  created_at: string;
}

export interface ArticleAnalytics {
  title: string;
  slug: string;
  reads: number;
  likes: number;
  bookmarks: number;
  rewards_collected: number;
  total_earnings: number;
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

const articleService = {
  // Get all published articles
  getPublishedArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles/see/');
    return response.data.results || response.data || []; // Handle paginated or direct response
  },

  // Get article by slug
  getArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await api.get(`/articles/${slug}/`);
    return response.data;
  },
  // Add this to services/articleService.ts
getAllWriterArticles: async (): Promise<Article[]> => {
  const response = await api.get('/articles/writer/articles/');
  return response.data.results || response.data || [];
},

  // Create a new article
  createArticle: async (data: ArticleFormData): Promise<Article> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('content', data.content);
    formData.append('tags', JSON.stringify(data.tags));
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }
    const response = await api.post('/articles/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update an existing article
  updateArticle: async (slug: string, data: ArticleFormData): Promise<Article> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('content', data.content);
    formData.append('tags', JSON.stringify(data.tags));
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }
    const response = await api.patch(`/articles/${slug}/update/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
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
      throw error.response?.data || { detail: 'Failed to request publish' };
    }
  },

  // Get analytics for content writer's articles
  getArticleAnalytics: async (): Promise<ArticleAnalytics[]> => {
    const response = await api.get('/articles/analytics/');
    return response.data;
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
  getPendingArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles/pending-publish/');
    return response.data.results || response.data || [];
  },

  // Approve an article for publishing (admin only)
  approveArticle: async (slug: string): Promise<{ detail: string }> => {
    const response = await api.post(`/articles/approve-publish/${slug}/`);
    return response.data;
  },

  // Toggle like status
  toggleLike: async (slug: string): Promise<ArticleLikeResponse | { detail: string }> => {
    const response = await api.post(`/articles/${slug}/like/`);
    return response.data;
  },

  // Check like status
  checkLikeStatus: async (slug: string): Promise<{ is_liked: boolean }> => {
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
  checkBookmarkStatus: async (slug: string): Promise<{ is_bookmarked: boolean }> => {
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

  // Get writer analytics
  getWriterAnalytics: async (): Promise<any> => {
    const response = await api.get('/articles/analytics/');
    return response.data;
  },

  checkArticleStatus: async (slug: string): Promise<{ status: string, message: string }> => {
    try {
      const response = await api.get(`/articles/${slug}/status/`);
      return response.data;
    } catch (error: any) {
      console.error('Check status error:', error.response?.data);
      throw error.response?.data || { status: 'error', message: 'Failed to check article status' };
    }
  },
};


export default articleService;