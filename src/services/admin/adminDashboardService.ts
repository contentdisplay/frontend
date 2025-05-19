import api from '../api';

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  reward_amount: number;
  expires_at: string;
  is_active: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface AnalyticsData {
  user_growth: Array<{ date: string; count: number }>;
  cumulative_users: Array<{ date: string; total: number }>;
  article_trends: Array<{ date: string; count: number }>;
  transaction_volume: Array<{ date: string; total_amount: number; count: number }>;
  top_earners: Array<{ username: string; total: number }>;
  user_article_ratio: Array<{ month: string; articles: number; users: number; ratio: number }>;
}

export const fetchAnalytics = async (days: number = 30): Promise<AnalyticsData> => {
  // Use the endpoint exactly as it appears in your dashboard/urls.py
  const response = await api.get(`/dashboard/admin/dashboard/analytics/?days=${days}`);
  return response.data;
};