// pages/articles/WriterArticlesPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  AlertCircle, BookOpen, Edit, Eye, FileText, Loader2, Plus, 
  PlusCircle, Send, Trash2, Info, Clock
} from 'lucide-react';
import ArticleCard from '@/components/articles/ArticleCard';
import articleService, { Article } from '@/services/articleService';
import walletService from '@/services/walletService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';

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
  
  useEffect(() => {
    loadArticles();
    loadWalletInfo();
  }, []);
  
  useEffect(() => {
    filterArticles();
  }, [articles, activeTab, searchTerm]);
  
  const loadArticles = async () => {
    setIsLoading(true);
    try {
      // Use the new endpoint that gets all articles for the current writer
      const data = await articleService.getAllWriterArticles();
      setArticles(data);
      
      // Calculate stats
      const reads = data.reduce((sum, article) => sum + article.normal_user_reads, 0);
      const likes = data.reduce((sum, article) => sum + article.likes_count, 0);
      
      // Get analytics for earnings
      const analytics = await articleService.getArticleAnalytics();
      const totalEarnings = analytics.reduce((sum, item) => sum + item.total_earnings, 0);
      
      setStats({
        total: data.length,
        published: data.filter(a => a.is_published).length,
        draft: data.filter(a => !a.is_published && !a.is_pending_publish).length,
        pending: data.filter(a => a.is_pending_publish).length,
        reads,
        likes,
        earnings: totalEarnings
      });
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Failed to load your articles');
    } finally {
      setIsLoading(false);
    }
  };
  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      // Try to get the data from the writer articles endpoint
      const data = await articleService.getAllWriterArticles();
      setArticles(data);
      
      // If analytics fails, at least we have the articles
      try {
        // Try to get analytics data, but don't block loading if it fails
        const analytics = await articleService.getArticleAnalytics();
        console.log('Article analytics loaded:', analytics);
        // You could use this data to enhance the UI if needed
      } catch (analyticsError) {
        console.warn('Failed to load analytics, but articles loaded successfully:', analyticsError);
        // Continue without analytics data
      }
    } catch (err: any) {
      console.error('Failed to fetch articles:', err);
      setError(err.response?.data?.detail || 'Failed to load articles');
      toast.error('Failed to load your articles');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadWalletInfo = async () => {
    try {
      const data = await walletService.getWalletInfo();
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Failed to load wallet info:', error);
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
        article.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredArticles(filtered);
  };
  
  const handleRequestPublish = (article: Article) => {
    setSelectedArticle(article);
    setShowPublishDialog(true);
  };
  
  const handlePublishConfirm = async () => {
    if (!selectedArticle) return;
    
    setIsSubmitting(true);
    try {
      // Check wallet balance first
      const balanceCheck = await walletService.checkPublishBalance();
      
      if (!balanceCheck.has_sufficient_balance) {
        toast.error(`Insufficient balance. You need ₹${balanceCheck.required_balance} to publish.`);
        navigate('/wallet');
        return;
      }
      
      const publishResult = await articleService.requestPublish(selectedArticle.slug);
      
      toast.success(publishResult.detail || 'Publish request sent successfully. An admin will review your article within 15 minutes.');
      
      if (publishResult.remaining_balance !== undefined) {
        setWalletBalance(publishResult.remaining_balance);
      }
      
      // Update the article in the list
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === selectedArticle.id 
            ? { ...article, is_pending_publish: true, status: 'pending' } 
            : article
        )
      );
      
      setShowPublishDialog(false);
    } catch (error: any) {
      console.error('Publish request error:', error);
      
      if (error.redirect_to_deposit) {
        toast.error('Insufficient balance. Redirecting to wallet page...');
        navigate('/wallet');
      } else {
        toast.error(error.detail || 'Failed to request publish');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    
    try {
      await articleService.deleteArticle(articleToDelete.slug);
      toast.success('Article deleted successfully');
      
      // Remove article from state
      setArticles(prevArticles => 
        prevArticles.filter(article => article.id !== articleToDelete.id)
      );
      
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
            className={buttonVariants({ 
              variant: "default", 
              className: "flex items-center" 
            })}
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
      
      <div className="mb-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Wallet Status</CardTitle>
            <CardDescription>Your current wallet balance for publishing articles</CardDescription>
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
                onClick={() => navigate('/writer/wallet')}
              >
                Manage Wallet
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
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
      </div>
      
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
              <Link 
                to="/writer/articles/create" 
                className={buttonVariants({ 
                  variant: "default", 
                  className: "mt-4" 
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Article
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="relative">
                <ArticleCard 
                  article={article}
                  variant="default"
                  onRequestPublish={() => handleRequestPublish(article)}
                />
                
                {/* Quick action buttons */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900"
                    onClick={() => navigate(`/articles/${article.slug}`)}
                    title="View Article"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900"
                    onClick={() => navigate(`/writer/articles/edit/${article.slug}`)}
                    title="Edit Article"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteClick(article)}
                    title="Delete Article"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Status badge */}
                <div className="absolute bottom-2 left-2">
                  {article.is_published ? (
                    <Badge variant="default" className="bg-green-600">Published</Badge>
                  ) : article.is_pending_publish ? (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                      </Badge>
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>
                  )}
                </div>
                
                {/* Publish button for drafts */}
                {!article.is_published && !article.is_pending_publish && (
                  <div className="absolute bottom-2 right-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRequestPublish(article)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Publish
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Publish Confirmation Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Publish Article</DialogTitle>
            <DialogDescription>
              Publishing an article requires a fee of ₹150.00 from your wallet balance.
            </DialogDescription>
          </DialogHeader>
          
          {selectedArticle && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="font-medium">Article: {selectedArticle.title}</p>
                <p className="text-sm text-gray-500 mt-1">{selectedArticle.description.substring(0, 100)}...</p>
              </div>
              
              <Alert className="bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800">
                <Clock className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />
                <AlertTitle className="text-indigo-700 dark:text-indigo-400">Review Timeline</AlertTitle>
                <AlertDescription className="text-indigo-600 dark:text-indigo-400">
                  After your request, an admin will review and approve your article typically within 15 minutes.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-sm text-gray-500">Current Balance:</p>
                  <p className="font-medium">{walletBalance !== null ? `₹${walletBalance.toFixed(2)}` : 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Publishing Fee:</p>
                  <p className="font-medium">₹150.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Balance After:</p>
                  <p className="font-medium">
                    {walletBalance !== null 
                      ? `₹${(walletBalance - 150).toFixed(2)}` 
                      : 'Calculating...'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePublishConfirm} 
              disabled={isSubmitting || (walletBalance !== null && walletBalance < 150)}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                  Processing...
                </>
              ) : (
                'Request Publish'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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