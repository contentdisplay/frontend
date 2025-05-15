// services/dashboardService.ts

import { ReactNode } from 'react';
import api from './api';
import articleService from './articleService';

// Define interfaces for dashboard data types
export interface TrendingArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  read_time: number;
  published_date: string;
  author: {
    username: string;
    avatar: string;
  };
  likes_count: number;
  views_count: number;
  reward_amount: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  reward_amount: number;
  code?: string;
  expires_at: string;
}

export interface TopTransaction {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  amount: number;
  date: string;
}

export interface UserStats {
  // Using snake_case to match backend response
  minutes_read: number;
  total_articles_read: number;
  ads_visited: number;
  bookmarked: number;
  liked: number;
  total_earned: number;
  rank: string;
  level: number;
  xp: number;
  next_level_xp: number;
  recent_achievements: Array<{
    id: string;
    title: string;
    description: string;
    xp: number;
    icon: string;
  }>;
  upcoming_rewards: Array<{
    title: string;
    progress: number;
    value: string;
    icon: string;
  }>;
  weekly_goals: Array<{
    title: string;
    current: number;
    target: number;
    icon: string;
  }>;
}

export interface UserActivity {
  all: ActivityEvent[];
  earnings: ActivityEvent[];
  reads: ActivityEvent[];
  likes: ActivityEvent[];
}

export interface ActivityEvent {
  id: string;
  type: 'read' | 'like' | 'reward' | 'system';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  article?: {
    title: string;
    slug: string;
  };
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

const dashboardService = {
  // Remove _getMockData function since we don't need mock data
  // Get trending articles
  getTrendingArticles: async (): Promise<TrendingArticle[]> => {
    try {
      const response = await api.get('/api/articles/trending/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trending articles:', error);
      // Fallback to published articles
      try {
        const articles = await articleService.getPublishedArticles();
        return articles.map((article) => ({
          id: article.id.toString(),
          title: article.title,
          slug: article.slug,
          excerpt: article.description,
          thumbnail: article.thumbnail || 'https://picsum.photos/300/200',
          read_time: Math.ceil(article.word_count / 200), // Estimate read time
          published_date: article.published_at || article.created_at,
          author: {
            username: article.author,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author}`,
          },
          likes_count: article.likes_count,
          views_count: article.normal_user_reads,
          reward_amount: article.reward,
        }));
      } catch (fallbackError) {
        console.error('Failed to fetch published articles:', fallbackError);
        return [];
      }
    }
  },

  // Get active offers
  getActiveOffers: async (): Promise<Offer[]> => {
    try {
      const response = await api.get('/api/dashboard/offers/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      return [];
    }
  },

  // Get top transactions
  getTopTransactions: async (): Promise<TopTransaction[]> => {
    try {
      const response = await api.get('/api/dashboard/top-transactions/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top transactions:', error);
      return [];
    }
  },

  // Get user stats
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await api.get('/api/dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return {
        minutes_read: 0,
        total_articles_read: 0,
        ads_visited: 0,
        bookmarked: 0,
        liked: 0,
        total_earned: 0,
        rank: 'Beginner',
        level: 1,
        xp: 0,
        next_level_xp: 100,
        recent_achievements: [],
        upcoming_rewards: [],
        weekly_goals: [],
      };
    }
  },

  // Get user activity
  getUserActivity: async (): Promise<UserActivity> => {
    try {
      const response = await api.get('/api/dashboard/activity/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      return { all: [], earnings: [], reads: [], likes: [] };
    }
  },

  // Get active promotions
  getActivePromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get('/api/dashboard/promotions/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      return [];
    }
  },
};

export default dashboardService;