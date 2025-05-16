import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users, FileText, Bell, TrendingUp, Wallet, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { Offer, Promotion } from '@/services/dashboardService';

interface Stats {
  users: number;
  articles: number;
  pendingArticles: number;
  notifications: number;
  pendingPromotions: number;
}

interface AnalyticsData {
  user_growth: Array<{ date: string; count: number }>;
  cumulative_users: Array<{ date: string; total: number }>;
  article_trends: Array<{ date: string; count: number }>;
  transaction_volume: Array<{ date: string; total_amount: number; count: number }>;
  top_earners: Array<{ username: string; total: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    articles: 0,
    pendingArticles: 0,
    notifications: 0,
    pendingPromotions: 0,
  });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({});
  const [newPromotion, setNewPromotion] = useState<Partial<Promotion>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
    fetchOffers();
    fetchPromotions();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, articlesRes, pendingArticlesRes, notificationsRes, promotionsRes] = await Promise.all([
        api.get('/api/auth/users/'), // Adjust if endpoint differs
        api.get('/api/articles/'),
        api.get('/api/articles/pending/'), // Adjust if endpoint differs
        api.get('/api/notification/'),
        api.get('/api/dashboard/promotions/list/'),
      ]);

      setStats({
        users: usersRes.data.length,
        articles: articlesRes.data.length,
        pendingArticles: pendingArticlesRes.data.length,
        notifications: notificationsRes.data.length,
        pendingPromotions: promotionsRes.data.filter((p: Promotion) => new Date(p.expires_at) > new Date()).length,
      });
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/dashboard/analytics/');
      setAnalytics(response.data);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      toast.error('Failed to load analytics data');
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await api.get('/api/dashboard/offers/list/');
      setOffers(response.data);
    } catch (err: any) {
      console.error('Failed to fetch offers:', err);
      toast.error('Failed to load offers');
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/api/dashboard/promotions/list/');
      setPromotions(response.data);
    } catch (err: any) {
      console.error('Failed to fetch promotions:', err);
      toast.error('Failed to load promotions');
    }
  };

  const handleCreateOffer = async () => {
    try {
      await api.post('/api/dashboard/offers/create/', {
        ...newOffer,
        is_active: newOffer.is_active ?? true,
        expires_at: newOffer.expires_at ? new Date(newOffer.expires_at).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      toast.success('Offer created successfully');
      setNewOffer({});
      fetchOffers();
    } catch (err: any) {
      console.error('Failed to create offer:', err);
      toast.error('Failed to create offer');
    }
  };

  const handleUpdateOffer = async (id: string, updates: Partial<Offer>) => {
    try {
      await api.put(`/api/dashboard/offers/${id}/update/`, {
        ...updates,
        expires_at: updates.expires_at ? new Date(updates.expires_at).toISOString() : undefined,
      });
      toast.success('Offer updated successfully');
      fetchOffers();
    } catch (err: any) {
      console.error('Failed to update offer:', err);
      toast.error('Failed to update offer');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await api.delete(`/api/dashboard/offers/${id}/delete/`);
      toast.success('Offer deleted successfully');
      fetchOffers();
    } catch (err: any) {
      console.error('Failed to delete offer:', err);
      toast.error('Failed to delete offer');
    }
  };

  const handleCreatePromotion = async () => {
    try {
      await api.post('/api/dashboard/promotions/create/', {
        ...newPromotion,
        is_active: newPromotion.is_active ?? true,
        start_date: newPromotion.start_date ? new Date(newPromotion.start_date).toISOString() : new Date().toISOString(),
        end_date: newPromotion.end_date ? new Date(newPromotion.end_date).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      toast.success('Promotion created successfully');
      setNewPromotion({});
      fetchPromotions();
    } catch (err: any) {
      console.error('Failed to create promotion:', err);
      toast.error('Failed to create promotion');
    }
  };

  const handleUpdatePromotion = async (id: string, updates: Partial<Promotion>) => {
    try {
      await api.put(`/api/dashboard/promotions/${id}/update/`, {
        ...updates,
        start_date: updates.start_date ? new Date(updates.start_date).toISOString() : undefined,
        end_date: updates.end_date ? new Date(updates.end_date).toISOString() : undefined,
      });
      toast.success('Promotion updated successfully');
      fetchPromotions();
    } catch (err: any) {
      console.error('Failed to update promotion:', err);
      toast.error('Failed to update promotion');
    }
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      await api.delete(`/api/dashboard/promotions/${id}/delete/`);
      toast.success('Promotion deleted successfully');
      fetchPromotions();
    } catch (err: any) {
      console.error('Failed to delete promotion:', err);
      toast.error('Failed to delete promotion');
    }
  };

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
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
        Admin Dashboard
      </h1>

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
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Platform Analytics</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.user_growth}>
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
                <LineChart data={analytics?.cumulative_users}>
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
              <CardTitle>Article Publications (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.article_trends}>
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
              <CardTitle>Transaction Volume (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.transaction_volume}>
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
        </div>
      </div>

      {/* Offer Management */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Manage Offers</h2>
        <Card>
          <CardHeader>
            <CardTitle>Create New Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newOffer.title || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newOffer.description || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={newOffer.image || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, image: e.target.value })}
                />
              </div>
              <div>
                <Label>Redemption Link</Label>
                <Input
                  value={newOffer.link || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, link: e.target.value })}
                />
              </div>
              <div>
                <Label>Reward Amount</Label>
                <Input
                  type="number"
                  value={newOffer.reward_amount || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, reward_amount: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Expiration Date</Label>
                <Input
                  type="datetime-local"
                  value={newOffer.expires_at || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, expires_at: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newOffer.is_active ?? true}
                  onCheckedChange={(checked) => setNewOffer({ ...newOffer, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <Button onClick={handleCreateOffer}>Create Offer</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Offers</CardTitle>
          </CardHeader>
          <CardContent>
            {offers.length === 0 ? (
              <p>No offers available.</p>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="border p-4 rounded-lg">
                    <h3 className="font-bold">{offer.title}</h3>
                    <p>{offer.description}</p>
                    <p>Reward: ${offer.reward_amount.toFixed(2)}</p>
                    <p>Expires: {new Date(offer.expires_at).toLocaleString()}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleUpdateOffer(offer.id, {
                            ...offer,
                            is_active: !offer.is_active,
                          })
                        }
                      >
                        {offer.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteOffer(offer.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Promotion Management */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Manage Promotions</h2>
        <Card>
          <CardHeader>
            <CardTitle>Create New Promotion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newPromotion.title || ''}
                  onChange={(e) => setNewPromotion({ ...newPromotion, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newPromotion.description || ''}
                  onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={newPromotion.image || ''}
                  onChange={(e) => setNewPromotion({ ...newPromotion, image: e.target.value })}
                />
              </div>
              <div>
                <Label>Link</Label>
                <Input
                  value={newPromotion.link || ''}
                  onChange={(e) => setNewPromotion({ ...newPromotion, link: e.target.value })}
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="datetime-local"
                  value={newPromotion.start_date || ''}
                  onChange={(e) => setNewPromotion({ ...newPromotion, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="datetime-local"
                  value={newPromotion.end_date || ''}
                  onChange={(e) => setNewPromotion({ ...newPromotion, end_date: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newPromotion.is_active ?? true}
                  onCheckedChange={(checked) => setNewPromotion({ ...newPromotion, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <Button onClick={handleCreatePromotion}>Create Promotion</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            {promotions.length === 0 ? (
              <p>No promotions available.</p>
            ) : (
              <div className="space-y-4">
                {promotions.map((promotion) => (
                  <div key={promotion.id} className="border p-4 rounded-lg">
                    <h3 className="font-bold">{promotion.title}</h3>
                    <p>{promotion.description}</p>
                    <p>Active: {new Date(promotion.start_date).toLocaleString()} - {new Date(promotion.end_date).toLocaleString()}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleUpdatePromotion(promotion.id, {
                            ...promotion,
                            is_active: !promotion.is_active,
                          })
                        }
                      >
                        {promotion.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeletePromotion(promotion.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}