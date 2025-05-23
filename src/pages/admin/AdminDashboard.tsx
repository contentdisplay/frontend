import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, FileText, Bell, TrendingUp, Wallet, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { fetchAnalytics, fetchDashboardStats, AnalyticsData, DashboardStats } from '@/services/admin/adminDashboardService';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    active_users: 0,
    content_writers: 0,
    normal_users: 0,
    pending_promotions: 0,
  });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const statsData = await fetchDashboardStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      toast.error('Failed to load dashboard stats');
      // Set fake data for development purposes if API fails
      setStats({
        total_users: 120,
        active_users: 100,
        content_writers: 20,
        normal_users: 80,
        pending_promotions: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const data = await fetchAnalytics(timeRange);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      toast.error('Failed to load analytics data');
      // Set fake data for development purposes if API fails
      setAnalytics({
        user_growth: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          count: Math.floor(Math.random() * 5) + 1
        })),
        cumulative_users: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          total: 90 + i * 3
        })),
        article_trends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          count: Math.floor(Math.random() * 3) + 1
        })),
        transaction_volume: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: Math.floor(Math.random() * 500) + 100,
          count: Math.floor(Math.random() * 10) + 1
        })),
        top_earners: Array.from({ length: 10 }, (_, i) => ({
          username: `user${i + 1}`,
          total: Math.floor(Math.random() * 1000) + 500
        })),
        user_article_ratio: Array.from({ length: 6 }, (_, i) => {
          const articles = Math.floor(Math.random() * 20) + 10;
          const users = Math.floor(Math.random() * 30) + 50;
          return {
            month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            articles,
            users,
            ratio: +(articles / users).toFixed(2)
          };
        })
      });
    }
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prepare data for a pie chart of user role distribution
  const userRoleDistributionData = [
    { name: 'Content Writers', value: stats.content_writers },
    { name: 'Normal Users', value: stats.normal_users },
  ];

  const statCards = [
    { title: 'Total Users', value: stats.total_users, icon: Users, color: 'bg-blue-600' },
    { title: 'Active Users', value: stats.active_users, icon: Users, color: 'bg-green-600' },
    { title: 'Content Writers', value: stats.content_writers, icon: FileText, color: 'bg-yellow-600' },
    { title: 'Normal Users', value: stats.normal_users, icon: Users, color: 'bg-purple-600' },
    { title: 'Pending Promotions', value: stats.pending_promotions, icon: Award, color: 'bg-red-600' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          Admin Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="time-range">Time Range:</Label>
          <Select 
            value={timeRange.toString()} 
            onValueChange={(value) => setTimeRange(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="30 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">6 months</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => {
            fetchStats();
            fetchAnalyticsData();
          }}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Analytics Charts */}
      {analytics && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Platform Analytics</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth (Last {timeRange} Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.user_growth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cumulative Users Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cumulative Users</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.cumulative_users}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#10b981" name="Total Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Article Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Article Publications (Last {timeRange} Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.article_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" name="Articles Published" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transaction Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume (Last {timeRange} Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.transaction_volume}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="total_amount" stroke="#ef4444" name="Total Amount ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="count" stroke="#f59e0b" name="Transactions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Role Distribution (Pie Chart) */}
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userRoleDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Earners (Bar Chart) */}
            <Card>
              <CardHeader>
                <CardTitle>Top Earners</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={analytics.top_earners}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="username" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#82ca9d" name="Balance" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User/Article Ratio Chart */}
            {analytics.user_article_ratio && (
              <Card>
                <CardHeader>
                  <CardTitle>User/Article Ratio by Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.user_article_ratio}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="articles" fill="#8884d8" name="Articles" />
                      <Bar yAxisId="left" dataKey="users" fill="#82ca9d" name="Users" />
                      <Line yAxisId="right" type="monotone" dataKey="ratio" stroke="#ff7300" name="Ratio" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}