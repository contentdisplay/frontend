import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Bell, TrendingUp, Wallet, Award } from 'lucide-react';
import userService from '@/services/admin/userService';
import articleService from '@/services/articleService';
import notificationService from '@/services/notificationService';
import promotionService from '@/services/promotionService';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Stats {
  users: number;
  articles: number;
  pendingArticles: number;
  notifications: number;
  pendingPromotions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    articles: 0,
    pendingArticles: 0,
    notifications: 0,
    pendingPromotions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [users, articles, pendingArticles, notifications, pendingPromotions] = await Promise.all([
          userService.getUsers(),
          articleService.getArticles(),
          articleService.getPendingArticles(),
          notificationService.getNotifications(),
          promotionService.getPendingPromotions(),
        ]);

        setStats({
          users: users.length,
          articles: articles.length,
          pendingArticles: pendingArticles.length,
          notifications: notifications.length,
          pendingPromotions: pendingPromotions.length,
        });
      } catch (err: any) {
        console.error('Failed to fetch stats:', err);
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-600' },
    { title: 'Total Articles', value: stats.articles, icon: FileText, color: 'bg-green-600' },
    { title: 'Pending Articles', value: stats.pendingArticles, icon: FileText, color: 'bg-yellow-600' },
    { title: 'Notifications', value: stats.notifications, icon: Bell, color: 'bg-purple-600' },
    { title: 'Pending Promotions', value: stats.pendingPromotions, icon: Award, color: 'bg-red-600' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
        Admin Dashboard
      </h1>
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {statCards.map((card, index) => (
          <Card key={index} className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 text-white ${card.color} rounded-full p-1`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}