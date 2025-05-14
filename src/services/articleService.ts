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
  like_count: number;
  bookmark_count: number;
}

interface ArticleLikeResponse {
  id: number;
  article: number;
  article_title: string;
  article_slug: string;
  created_at: string;
}

interface ArticleBookmarkResponse {
  id: number;
  article: number;
  article_title: string;
  article_slug: string;
  created_at: string;
}

const articleService = {
  getPublishedArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles/see/');
    return response.data.results || [];
  },

  getArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await api.get(`/articles/${slug}/`);
    return response.data;
  },

  collectReward: async (slug: string, readingTimeMinutes: number): Promise<{ detail: string; reward: number; multiplier: number }> => {
    const response = await api.post(`/articles/${slug}/collect-reward/`, { reading_time_minutes: readingTimeMinutes });
    return response.data;
  },

  toggleLike: async (slug: string): Promise<ArticleLikeResponse | { detail: string }> => {
    const response = await api.post(`/articles/${slug}/like/`);
    return response.data;
  },

  checkLikeStatus: async (slug: string): Promise<{ is_liked: boolean }> => {
    const response = await api.get(`/articles/${slug}/like/`);
    return response.data;
  },

  getLikedArticles: async (): Promise<ArticleLikeResponse[]> => {
    const response = await api.get('/articles/likes/');
    return response.data;
  },

  toggleBookmark: async (slug: string): Promise<ArticleBookmarkResponse | { detail: string }> => {
    const response = await api.post(`/articles/${slug}/bookmark/`);
    return response.data;
  },

  checkBookmarkStatus: async (slug: string): Promise<{ is_bookmarked: boolean }> => {
    const response = await api.get(`/articles/${slug}/bookmark/`);
    return response.data;
  },

  getBookmarkedArticles: async (): Promise<ArticleBookmarkResponse[]> => {
    const response = await api.get('/articles/bookmarks/');
    return response.data;
  },

  getTrendingArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles/trending/');
    return response.data;
  },
};

export default articleService;