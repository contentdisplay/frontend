// pages/writer/WriterDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, FileText, Clock, Heart, Bookmark, Award, TrendingUp, Eye } from 'lucide-react';
import ArticleCard from '@/components/articles/ArticleCard';
import { useAuth } from '@/context/AuthContext';
import articleService, { Article, WriterAnalytics } from '@/services/articleService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function WriterDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [analytics, setAnalytics] = useState<WriterAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [articlesData, analyticsData] = await Promise.all([
          articleService.getAllWriterArticles(),
          articleService.getWriterAnalytics()
        ]);
        
        setArticles(articlesData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching writer data:', error);
        toast.error('Failed to load writer data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestPublish = async (slug: string) => {
    try {
      await articleService.requestPublish(slug);
      // Refresh articles to update status
      const updatedArticles = await articleService.getAllWriterArticles();
      setArticles(updatedArticles);
      toast.success('Publish request sent. Article is pending approval.');
    } catch (error: any) {
      if (error.redirect_to_deposit) {
        toast.error('Insufficient balance. Please add funds to your wallet.');
        navigate('/wallet');
      } else {
        toast.error(error.detail || 'Failed to request publish');
      }
    }
  };

  const filteredArticles = () => {
    switch (activeTab) {
      case 'published':
        return articles.filter(article => article.is_published);
      case 'pending':
        return articles.filter(article => article.is_pending_publish);
      case 'drafts':
        return articles.filter(article => !article.is_published && !article.is_pending_publish);
      default:
        return articles;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not published';
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Writer Dashboard</h1>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link to="/writer/articles/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Article
            </Link>
          </Button>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="border-indigo-100 dark:border-indigo-900/30">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-8 w-16" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="border-indigo-100 dark:border-indigo-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Total Articles
                  </CardTitle>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {analytics?.total_articles || 0}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-500 space-x-2">
                    <span className="inline-flex items-center bg-green-100 text-green-800 rounded px-2 py-0.5">
                      {analytics?.status_counts.published || 0} Published
                    </span>
                    <span className="inline-flex items-center bg-yellow-100 text-yellow-800 rounded px-2 py-0.5">
                      {analytics?.status_counts.pending || 0} Pending
                    </span>
                    <span className="inline-flex items-center bg-gray-100 text-gray-800 rounded px-2 py-0.5">
                      {analytics?.status_counts.draft || 0} Drafts
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-100 dark:border-indigo-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Total Reads
                  </CardTitle>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {analytics?.total_reads || 0}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">
                    Readers engaged with your content
                  </p>
                </CardContent>
              </Card>

              <Card className="border-indigo-100 dark:border-indigo-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Engagement
                  </CardTitle>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {(analytics?.total_likes || 0) + (analytics?.total_bookmarks || 0)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-500 space-x-2">
                    <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 rounded px-2 py-0.5">
                      <Heart className="h-3 w-3" /> {analytics?.total_likes || 0}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded px-2 py-0.5">
                      <Bookmark className="h-3 w-3" /> {analytics?.total_bookmarks || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-100 dark:border-indigo-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Award className="h-4 w-4" /> Total Earnings
                  </CardTitle>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{analytics?.total_earnings.toFixed(2) || "0.00"}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">
                    {analytics?.total_rewards_collected || 0} rewards collected by readers
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Articles Tabs */}
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Articles</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="border-indigo-100 dark:border-indigo-900/30">
                    <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredArticles().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles().map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onRequestPublish={handleRequestPublish}
                    onClick={() => navigate(`/articles/${article.slug}`)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 p-8 text-center">
                <CardContent className="pt-4">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {activeTab === 'all' 
                      ? "You haven't created any articles yet" 
                      : activeTab === 'published' 
                        ? "You don't have any published articles" 
                        : activeTab === 'pending' 
                          ? "You don't have any pending articles" 
                          : "You don't have any draft articles"}
                  </p>
                  <Button asChild>
                    <Link to="/writer/articles/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Article
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Popular Articles Section */}
        {!isLoading && analytics && analytics.article_stats.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Your Top Performing Articles
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                    <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300">Title</th>
                    <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300">Published</th>
                    <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300 text-center">Reads</th>
                    <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300 text-center">Likes</th>
                    <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300 text-center">Bookmarks</th>
                    <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300 text-center">Rewards</th>
                    <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300 text-right">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.article_stats
                    .sort((a, b) => b.reads - a.reads)
                    .slice(0, 5)
                    .map((article, index) => (
                      <tr 
                        key={article.slug} 
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="p-3">
                          <Link 
                            to={`/articles/${article.slug}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                          >
                            {article.title}
                          </Link>
                        </td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(article.published_at)}
                        </td>
                        <td className="p-3 text-sm text-center text-gray-600 dark:text-gray-400">
                          {article.reads}
                        </td>
                        <td className="p-3 text-sm text-center text-rose-600 dark:text-rose-400">
                          {article.likes}
                        </td>
                        <td className="p-3 text-sm text-center text-blue-600 dark:text-blue-400">
                          {article.bookmarks}
                        </td>
                        <td className="p-3 text-sm text-center text-amber-600 dark:text-amber-400">
                          {article.rewards_collected}
                        </td>
                        <td className="p-3 text-sm text-right font-medium text-emerald-600 dark:text-emerald-400">
                          ₹{article.total_earnings.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}