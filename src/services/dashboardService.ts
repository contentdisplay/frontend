// services/dashboardService.ts

import { ReactNode } from 'react';
import api from './api';

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
  // Mock data function to provide fallback data when API fails
  _getMockData: (type: string) => {
    console.log(`Getting mock data for ${type} due to API failure`);
    
    // Return appropriate mock data based on type
    switch(type) {
      case 'trending':
        return Array(5).fill(0).map((_, i) => ({
          id: `mock-${i}`,
          title: `Mock Article ${i + 1}`,
          slug: `mock-article-${i + 1}`,
          excerpt: 'This is a mock article created because the API endpoint failed.',
          thumbnail: `https://picsum.photos/seed/${i + 1}/300/200`,
          read_time: 5,
          published_date: new Date().toISOString(),
          author: {
            username: 'Mock User',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=mock${i}`
          },
          likes_count: Math.floor(Math.random() * 100),
          views_count: Math.floor(Math.random() * 1000),
          reward_amount: Math.random() * 10
        }));
      case 'stats':
        return {
          minutes_read: 45,
          total_articles_read: 25,
          ads_visited: 5,
          bookmarked: 10,
          liked: 15,
          total_earned: 120.5,
          rank: "Intermediate",
          level: 2,
          xp: 65,
          next_level_xp: 100,
          recent_achievements: [
            {
              id: "mock-achievement-1",
              title: "Dedicated Reader",
              description: "Read 5 or more articles",
              xp: 20,
              icon: "BookOpen"
            },
            {
              id: "mock-achievement-2",
              title: "Engaged Reviewer",
              description: "Liked 3 or more articles",
              xp: 15,
              icon: "ThumbsUp"
            }
          ],
          upcoming_rewards: [
            {
              title: "Reading Milestone",
              progress: 70,
              value: "$5.00",
              icon: "Book"
            }
          ],
          weekly_goals: [
            {
              title: "Read articles",
              current: 5,
              target: 10,
              icon: "FileText"
            },
            {
              title: "Engage with content",
              current: 8,
              target: 15,
              icon: "MessageSquare"
            }
          ]
        };
      case 'transactions':
        return Array(5).fill(0).map((_, i) => ({
          id: `mock-tx-${i}`,
          user: {
            username: `user${i + 1}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`
          },
          amount: Math.random() * 50,
          date: new Date().toISOString()
        }));
      case 'activity':
        return {
          all: Array(5).fill(0).map((_, i) => ({
            id: `mock-activity-${i}`,
            type: ['read', 'like', 'reward', 'system'][Math.floor(Math.random() * 4)] as 'read' | 'like' | 'reward' | 'system',
            title: `Mock Activity ${i + 1}`,
            description: 'This is mock activity data.',
            timestamp: new Date().toISOString(),
            amount: Math.random() * 5,
            article: {
              title: `Mock Article ${i + 1}`,
              slug: `mock-article-${i + 1}`
            }
          })),
          earnings: [],
          reads: [],
          likes: []
        };
      default:
        return [];
    }
  },

  // Get trending articles
  getTrendingArticles: async (): Promise<TrendingArticle[]> => {
    try {
      // Try the correct endpoint - note that the trailing slash might be important in Django
      const response = await api.get('/api/articles/trending/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trending articles:', error);
      
      // Return mock data as fallback
      return dashboardService._getMockData('trending') as TrendingArticle[];
    }
  },

  // Get active offers
  getActiveOffers: async (): Promise<Offer[]> => {
    try {
      const response = await api.get('/api/offers/active/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      return [];
    }
  },

  // Get top transactions
  getTopTransactions: async (): Promise<TopTransaction[]> => {
    try {
      const response = await api.get('/api/wallet/top-transactions/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top transactions:', error);
      return dashboardService._getMockData('transactions') as TopTransaction[];
    }
  },

  // Get user stats
  getUserStats: async (): Promise<UserStats> => {
    try {
      // Use the correct endpoint
      const response = await api.get('/api/user/stats/');
      
      // Return the data directly without transformation
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      
      // Return mock data as fallback
      return dashboardService._getMockData('stats') as UserStats;
    }
  },

  // Get user activity
  getUserActivity: async (): Promise<UserActivity> => {
    try {
      const response = await api.get('/api/user/activity/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      
      const mockData = dashboardService._getMockData('activity') as UserActivity;
      
      // Process mock data to create filtered views
      if (mockData.all && mockData.all.length > 0) {
        mockData.earnings = mockData.all.filter(item => item.type === 'reward');
        mockData.reads = mockData.all.filter(item => item.type === 'read');
        mockData.likes = mockData.all.filter(item => item.type === 'like');
      }
      
      return mockData;
    }
  },

  // Get active promotions
  getActivePromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get('/api/promotions/active/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      return [];
    }
  }
};

export default dashboardService;