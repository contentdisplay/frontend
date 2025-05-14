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

const articleService = {
  // Get all published articles
  getPublishedArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles/see/');
    return response.data.results || []; // Handle paginated response
  },

  // Get article by slug
  getArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await api.get(`/articles/${slug}/`);
    return response.data;
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
  requestPublish: async (slug: string): Promise<{ detail: string }> => {
    const response = await api.post(`/articles/request-publish/${slug}/`);
    return response.data;
  },

  // Get analytics for content writer's articles
  getArticleAnalytics: async (): Promise<ArticleAnalytics[]> => {
    const response = await api.get('/articles/analytics/');
    return response.data;
  },

  // Collect reward for reading an article
  collectReward: async (slug: string, readingTimeSeconds: number): Promise<RewardCollectionResponse> => {
    const response = await api.post(`/articles/${slug}/collect-reward/`, {
      reading_time: readingTimeSeconds,
    });
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
};

export default articleService;