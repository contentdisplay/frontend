import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  AlertCircle, BookOpen, Info, PlusCircle, Loader2 
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/context/AuthContext';
import articleService, { Article } from '@/services/articleService';
import walletService from '@/services/walletService';
import { ArticleList } from '@/components/articles/ArticleList';
import { ArticleStats } from '@/components/articles/ArticleStats';

export default function WriterArticlesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    reads: 0,
    likes: 0,
    earnings: 0
  });
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (user && user.role !== 'writer') {
      setError('You need writer privileges to view articles.');
    }
    
    loadArticles();
    loadWalletInfo();
  }, [user]);
  
  useEffect(() => {
    filterArticles();
  }, [articles, activeTab, searchTerm]);
  
  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const articlesData = await articleService.getPublishedArticles();
      console.log('Loaded articles:', articlesData);
      
      setArticles(articlesData);
      
      // Calculate stats
      const reads = articlesData.reduce((sum, article) => sum + (article.total_reads || 0), 0);
      const likes = articlesData.reduce((sum, article) => sum + (article.likes_count || 0), 0);
      
      const statsObj = {
        total: articlesData.length,
        published: articlesData.filter(a => a.is_published).length,
        draft: articlesData.filter(a => !a.is_published && !a.is_pending_publish).length,
        pending: articlesData.filter(a => a.is_pending_publish).length,
        reads,
        likes,
        earnings: 0 // Default value
      };
      
      loadEarningsData(statsObj);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Failed to load your articles');
      setArticles([]);
      setStats({
        total: 0, published: 0, draft: 0, pending: 0, reads: 0, likes: 0, earnings: 0
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadEarningsData = async (statsObj) => {
    try {
      const earnings = await articleService.getWriterEarnings();
      
      // Handle different response formats
      const earningsArray = Array.isArray(earnings) ? earnings : 
                          earnings?.results ? earnings.results : 
                          earnings?.data ? earnings.data : [];
      
      if (earningsArray.length > 0) {
        const totalEarnings = earningsArray.reduce((sum, item) => {
          return sum + (item.points_earned || 0);
        }, 0);
        
        statsObj.earnings = totalEarnings;
      }
      
      setStats(statsObj);
    } catch (error) {
      console.log('Using default earnings value due to API error:', error);
      setStats(statsObj);
    }
  };
  
  const loadWalletInfo = async () => {
    try {
      const data = await walletService.getWalletInfo();
      setWalletBalance(data.reward_points || data.balance || 0);
    } catch (error) {
      console.error('Failed to load wallet info:', error);
      toast.error('Failed to load wallet information');
    }
  };
  
  const filterArticles = () => {
    if (!articles.length) {
      setFilteredArticles([]);
      return;
    }
    
    let filtered = [...articles];
    
    // Filter by tab
    if (activeTab === 'published') {
      filtered = filtered.filter(article => article.is_published);
    } else if (activeTab === 'drafts') {
      filtered = filtered.filter(article => !article.is_published && !article.is_pending_publish);
    } else if (activeTab === 'pending') {
      filtered = filtered.filter(article => article.is_pending_publish);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredArticles(filtered);
  };
  
  const handleRequestPublish = async (slug: string) => {
    try {
      if ((walletBalance || 0) < 150) {
        toast.error('Insufficient balance. You need ₹150 to publish.');
        navigate('/wallet');
        return;
      }
      
      const response = await articleService.requestPublish(slug);
      
      toast.success(response.detail || 'Publish request sent successfully');
      
      // Refresh articles list
      loadArticles();
      
      // Update wallet balance
      setWalletBalance((prevBalance) => (prevBalance !== null ? prevBalance - 150 : null));
      
    } catch (error: any) {
      console.error('Publish request error:', error);
      
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('Insufficient')) {
        toast.error('Insufficient balance. Redirecting to wallet page...');
        navigate('/wallet');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to request publish');
      }
    }
  };
  
  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!articleToDelete?.slug) return;
    
    try {
      await articleService.deleteArticle(articleToDelete.slug);
      toast.success('Article deleted successfully');
      
      // Refresh articles
      loadArticles();
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
            My Articles
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your articles and track their performance
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link 
            to="/writer/articles/create" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </div>
      </div>
      
      {/* Writer Guidelines Alert */}
      <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 mb-6">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Writer Guidelines</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          <p>As a content writer, you have full control over your articles. You can create, edit, and delete your articles at any time.</p>
          <p className="mt-2">After requesting publication (₹150 fee), our admin team will review your article within <strong>15 minutes</strong> before it's published.</p>
        </AlertDescription>
      </Alert>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="md:col-span-1 border-none shadow-md bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
            <div className="flex flex-wrap mt-2 gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {stats.published} Published
              </Badge>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                {stats.pending} Pending
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {stats.draft} Drafts
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1 border-none shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Reads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.reads}</p>
            <div className="flex mt-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <BookOpen className="h-3 w-3 mr-1" /> Reader Engagement
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1 border-none shadow-md bg-gradient-to-br from-pink-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.likes}</p>
            <div className="flex mt-2">
              <Badge variant="outline" className="bg-pink-100 text-pink-800">
                <span className="mr-1">❤</span> Reader Appreciation
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1 border-none shadow-md bg-gradient-to-br from-amber-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{stats.earnings.toFixed(2)}</p>
            <div className="flex mt-2">
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                <span className="mr-1">💰</span> From All Articles
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Wallet Status Card */}
      <Card className="border-none shadow-md mb-8">
        <CardHeader>
          <CardTitle>Wallet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Current Balance:</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ₹{walletBalance?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
              onClick={() => navigate('/wallet')}
            >
              Manage Wallet
            </Button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <p>
              Publishing an article requires a fee of ₹150.00. 
              {walletBalance !== null && walletBalance < 150
                ? ` You need ₹${(150 - walletBalance).toFixed(2)} more to publish.`
                : ' Your balance is sufficient for publishing!'
              }
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Article Filters and List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="w-full sm:w-auto">
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No articles found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {searchTerm 
                ? "Try adjusting your search criteria"
                : activeTab === "drafts" 
                  ? "You don't have any drafts yet. Start creating a new article!"
                  : activeTab === "pending"
                  ? "You don't have any pending articles awaiting approval."
                  : activeTab === "published"
                  ? "You don't have any published articles yet."
                  : "Start by creating a new article"
              }
            </p>
            {!searchTerm && (
              <Button className="mt-4" asChild>
                <Link to="/writer/articles/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Article
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <ArticleList
            articles={filteredArticles}
            isLoading={false}
            onRequestPublish={handleRequestPublish}
            variant="default"
          />
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{articleToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}