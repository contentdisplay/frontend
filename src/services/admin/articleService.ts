import api from '../api';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: { id: number; username: string };
  status: string;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  bookmarks_count?: number;
}

const articleService = {
  // Get all articles
  getArticles: async (): Promise<Article[]> => {
    try {
      const response = await api.get('/articles/see/');
      
      // Handle various response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        // Handle pagination response format
        return response.data.results;
      } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Handle single object response
        if (response.data.id) {
          return [response.data];
        }
      }
      
      // Default: return empty array
      return [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  },
  
  // Get a specific article by slug
  getArticle: async (slug: string): Promise<Article> => {
    const response = await api.get(`/articles/${slug}/`);
    return response.data;
  },
  
  // Create a new article
  createArticle: async (articleData: Partial<Article>): Promise<Article> => {
    const response = await api.post('/articles/create/', articleData);
    return response.data;
  },
  
  // Update an article
  updateArticle: async (slug: string, articleData: Partial<Article>): Promise<Article> => {
    const response = await api.put(`/articles/${slug}/update/`, articleData);
    return response.data;
  },
  
  // Delete an article
  deleteArticle: async (slug: string): Promise<void> => {
    await api.delete(`/articles/${slug}/delete/`);
  },
  
  // Get pending articles awaiting approval
  getPendingArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles/pending-publish/');
    return response.data;
  },
  
  // Approve an article for publishing
  approveArticle: async (slug: string): Promise<void> => {
    await api.post(`/articles/approve-publish/${slug}/`);
  },
  
  // Request to publish an article
  requestPublish: async (slug: string): Promise<void> => {
    await api.post(`/articles/request-publish/${slug}/`);
  },
  
  // Update article status (draft, pending, published, rejected)
  updateArticleStatus: async (id: number, status: string): Promise<void> => {
    await api.patch(`/articles/${id}/status/`, { status });
  },
  
  // Get trending articles
  getTrendingArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles/trending/');
    return response.data;
  },
  
  // Like or unlike an article
  toggleLike: async (slug: string): Promise<void> => {
    await api.post(`/articles/${slug}/like/`);
  },
  
  // Bookmark or unbookmark an article
  toggleBookmark: async (slug: string): Promise<void> => {
    await api.post(`/articles/${slug}/bookmark/`);
  },
  
  // Get user's liked articles
  getLikedArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles/likes/');
    return response.data;
  },
  
  // Get user's bookmarked articles
  getBookmarkedArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles/bookmarks/');
    return response.data;
  },
  
  // Collect reward for an article
  collectReward: async (slug: string): Promise<void> => {
    await api.post(`/articles/${slug}/collect-reward/`);
  }
};

export default articleService;