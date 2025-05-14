// services/contentWriterService.ts
import api from './api';
import { Article } from './articleService';

export interface ArticleFormData {
  title: string;
  description: string;
  content: string;
  tags: string[];
  thumbnail?: File;
}

const contentWriterService = {
  // Get all articles created by the logged in writer
  getMyArticles: async (): Promise<Article[]> => {
    try {
      // Fixed API endpoint to match backend URL structure
      const response = await api.get('/articles/see/');
      return response.data.results || [];
    } catch (error: any) {
      console.error('Failed to fetch writer articles:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch your articles');
    }
  },
  
  // Create a new article
  createArticle: async (articleData: ArticleFormData): Promise<Article> => {
    try {
      const formData = new FormData();
      formData.append('title', articleData.title);
      formData.append('description', articleData.description);
      formData.append('content', articleData.content);
      formData.append('tags', JSON.stringify(articleData.tags));
      
      if (articleData.thumbnail) {
        formData.append('thumbnail', articleData.thumbnail);
      }
      
      const response = await api.post('/articles/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to create article:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create article');
    }
  },
  
  // Update an existing article
  updateArticle: async (slug: string, articleData: Partial<ArticleFormData>): Promise<Article> => {
    try {
      const formData = new FormData();
      
      if (articleData.title) formData.append('title', articleData.title);
      if (articleData.description) formData.append('description', articleData.description);
      if (articleData.content) formData.append('content', articleData.content);
      if (articleData.tags) formData.append('tags', JSON.stringify(articleData.tags));
      if (articleData.thumbnail) formData.append('thumbnail', articleData.thumbnail);
      
      const response = await api.put(`/articles/${slug}/update/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to update article:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update article');
    }
  },
  
  // Delete an article
  deleteArticle: async (slug: string): Promise<void> => {
    try {
      await api.delete(`/articles/${slug}/delete/`);
    } catch (error: any) {
      console.error('Failed to delete article:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete article');
    }
  },
  
  // Request to publish an article (requires payment)
  requestPublish: async (slug: string): Promise<any> => {
    try {
      const response = await api.post(`/articles/request-publish/${slug}/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to request publish:', error);
      throw new Error(error.response?.data?.detail || 'Failed to request publication. Make sure you have sufficient balance');
    }
  },
  
  // Get pending publication requests
  getPendingPublications: async (): Promise<Article[]> => {
    try {
      const response = await api.get('/articles/pending-publish/');
      return response.data.results || [];
    } catch (error: any) {
      console.error('Failed to fetch pending publications:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch pending publications');
    }
  }
};

export default contentWriterService;