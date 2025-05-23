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

export interface DashboardStats {
  total_users: number;
  active_users: number;
  content_writers: number;
  normal_users: number;
  pending_promotions: number;
}

export const fetchAnalytics = async (days: number = 30): Promise<AnalyticsData> => {
  const response = await api.get(`/dashboard/admin/dashboard/analytics/?days=${days}`);
  return response.data;
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/auth/admin/dashboard/');
  return response.data;
};