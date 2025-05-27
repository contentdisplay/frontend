import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  AlertCircle, BookOpen, Info, PlusCircle, Loader2, 
  Heart, DollarSign, CheckCircle, Clock, Wallet, Edit, Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

import { useAuth } from '@/context/AuthContext';
import articleService, { Article } from '@/services/articleService';
import walletService from '@/services/walletService';

// Enhanced ArticleCard component with navigation to detail page
const ArticleCard = ({ 
  article, 
  onEdit, 
  onDelete, 
  onRequestPublish 
}: { 
  article: Article, 
  onEdit: (article: Article) => void, 
  onDelete: (article: Article) => void,
  onRequestPublish: (id: number) => void
}) => {
  const statusColors = {
    draft: "bg-blue-100 text-blue-800 border-blue-300",
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    published: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300"
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    if (status === 'draft') return 'Draft';
    if (status === 'pending') return 'Pending Review';
    if (status === 'published') return 'Published';
    if (status === 'rejected') return 'Rejected';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'draft') return <Edit className="h-3 w-3 mr-1" />;
    if (status === 'pending') return <Clock className="h-3 w-3 mr-1" />;
    if (status === 'published') return <CheckCircle className="h-3 w-3 mr-1" />;
    if (status === 'rejected') return <AlertCircle className="h-3 w-3 mr-1" />;
    return null;
  };

  const truncate = (text: string, length: number) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const getWordCountColor = (count: number) => {
    if (count < 100) return "text-red-500";
    if (count < 500) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      {article.thumbnail && (
        <Link to={`/writer/articles/${article.slug}`}>
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={article.thumbnail} 
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </Link>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className={`${getStatusColor(article.status)} flex items-center`}>
            {getStatusIcon(article.status)}
            {getStatusText(article.status)}
          </Badge>
          <div className="flex space-x-1">
            <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {article.total_likes || 0}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center">
              <BookOpen className="h-3 w-3 mr-1" />
              {article.total_reads || 0}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg mt-2 line-clamp-2">
          <Link to={`/writer/articles/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          <div className="flex justify-between mb-1">
            <span>Word Count:</span>
            <span className={getWordCountColor(article.word_count || 0)}>
              {article.word_count || 0} words
            </span>
          </div>
          {article.reward !== undefined && (
            <div className="flex justify-between">
              <span>Reward Points:</span>
              <span className="text-amber-600">{article.reward.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        <div className="mb-2 h-20 overflow-hidden text-sm text-gray-600 dark:text-gray-300">
          {article.content 
            ? truncate(article.content.replace(/<[^>]*>/g, ' '), 150)
            : "No content available."
          }
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => onEdit(article)}
        >
          <Edit className="h-3.5 w-3.5 mr-2" />
          Edit
        </Button>
        
        {article.status === 'draft' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50"
            onClick={() => onRequestPublish(article.id)}
          >
            <Wallet className="h-3.5 w-3.5 mr-2" />
            Publish
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => onDelete(article)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function WriterArticlesPage() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [articleToPublish, setArticleToPublish] = useState<Article | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
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
        const response = await articleService.getPublishedArticles();
        const articlesData = Array.isArray(response.results) ? response.results : [];
        
        // Filter articles by the current user's ID
        const userArticles = articlesData.filter(article => article.author === parseInt(user?.id || '0'));
        
        setArticles(userArticles);
        
        const reads = userArticles.reduce((sum, article) => sum + (article.total_reads || 0), 0);
        const likes = userArticles.reduce((sum, article) => sum + (article.likes_count || 0), 0);
        
        const statsObj = {
            total: userArticles.length,
            published: userArticles.filter(a => a.status === 'published').length,
            draft: userArticles.filter(a => a.status === 'draft').length,
            pending: userArticles.filter(a => a.status === 'pending').length,
            reads,
            likes,
            earnings: 0
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
      
      let totalEarnings = 0;
      
      if (typeof earnings === 'object' && earnings !== null) {
        if (typeof earnings.total_points_earned === 'number') {
          totalEarnings = earnings.total_points_earned;
        } else if (Array.isArray(earnings.articles)) {
          totalEarnings = earnings.articles.reduce((sum, item) => {
            return sum + (item.points_earned || 0);
          }, 0);
        }
      }
      
      statsObj.earnings = totalEarnings;
      setStats(statsObj);
    } catch (error) {
      console.log('Using default earnings value due to API error:', error);
      setStats(statsObj);
    }
  };
  
  const loadWalletInfo = async () => {
    try {
      const data = await walletService.getWalletInfo();
      setWalletInfo(data); // Store the complete wallet info
      setWalletBalance(parseFloat(data.balance) || 0); // Keep this for backward compatibility
    } catch (error) {
      console.error('Failed to load wallet info:', error);
      toast.error('Failed to load wallet information');
      setWalletBalance(0);
      setWalletInfo(null);
    }
  };
  
  const filterArticles = () => {
    if (!articles.length) {
      setFilteredArticles([]);
      return;
    }
    
    let filtered = [...articles];
    
    if (activeTab === 'published') {
      filtered = filtered.filter(article => article.status === 'published');
    } else if (activeTab === 'drafts') {
      filtered = filtered.filter(article => article.status === 'draft');
    } else if (activeTab === 'pending') {
      filtered = filtered.filter(article => article.status === 'pending');
    }
    
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredArticles(filtered);
  };
  
  const handleEditArticle = (article: Article) => {
    navigate(`/writer/articles/edit/${article.slug || article.id}`);
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
      
      loadArticles();
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };
  
  const initiatePublishRequest = (article: Article) => {
    if ((walletBalance || 0) < 150) {
      toast.error('Insufficient wallet balance. Add funds to publish.');
      navigate('/writer/wallet');
      return;
    }
    
    setArticleToPublish(article);
    setShowPublishDialog(true);
  };
  
  const handlePublishConfirm = async () => {
    if (!articleToPublish) return;
    
    try {
      setIsPublishing(true);
      await articleService.requestPublish(articleToPublish.id);
      
      setWalletBalance((prevBalance) => (prevBalance !== null ? prevBalance - 150 : null));
      
      toast.success('Article submitted for review! An admin will approve it shortly.');
      setShowPublishDialog(false);
      
      loadArticles();
    } catch (error: any) {
      console.error('Publish request error:', error);
      
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('Insufficient')) {
        toast.error('Insufficient balance. Redirecting to wallet page...');
        navigate('/writer/wallet');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to request publish');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive" className="my-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="w-full h-48">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="flex gap-2 pt-2 border-t">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }
    
    if (filteredArticles.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg my-6">
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
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredArticles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            onEdit={handleEditArticle}
            onDelete={handleDeleteClick}
            onRequestPublish={initiatePublishRequest}
          />
        ))}
      </div>
    );
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
      
      <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 mb-6">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Writer Guidelines</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          <p>As a content writer, you have full control over your articles. You can create, edit, and delete your articles at any time.</p>
          <p className="mt-2">After requesting publication (₹150 fee), our admin team will review your article within <strong>15 minutes</strong> before it's published.</p>
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-none shadow-md bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Draft</span>
                <span>Pending</span>
                <span>Published</span>
              </div>
              <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${stats.total > 0 ? (stats.draft / stats.total) * 100 : 0}%` }}></div>
                <div className="bg-amber-500 h-full" style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}></div>
                <div className="bg-green-500 h-full" style={{ width: `${stats.total > 0 ? (stats.published / stats.total) * 100 : 0}%` }}></div>
              </div>
              <div className="flex flex-wrap mt-2 gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {stats.draft} Drafts
                </Badge>
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  {stats.pending} Pending
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {stats.published} Published
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Reads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.reads}</p>
            <div className="mt-4">
              <Progress value={Math.min(stats.reads, 1000) / 10} className="h-2" />
              <div className="flex mt-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  <BookOpen className="h-3 w-3 mr-1" /> Reader Engagement
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-pink-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.likes}</p>
            <div className="mt-4">
              <Progress value={Math.min(stats.likes, 100)} className="h-2" />
              <div className="flex mt-2">
                <Badge variant="outline" className="bg-pink-100 text-pink-800">
                  <Heart className="h-3 w-3 mr-1" /> Reader Appreciation
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-amber-50 to-white dark:from-gray-800 dark:to-gray-900">
  <CardHeader className="pb-2">
    <CardTitle className="text-lg">Total Earnings</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">₹{walletInfo?.reward_points?.toFixed(2) || stats.earnings.toFixed(2)}</p>
    <div className="mt-4">
      <Progress value={Math.min((walletInfo?.reward_points || stats.earnings), 1000) / 10} className="h-2" />
      <div className="flex mt-2">
        <Badge variant="outline" className="bg-amber-100 text-amber-800">
          <DollarSign className="h-3 w-3 mr-1" /> Reward Points
        </Badge>
      </div>
    </div>
  </CardContent>
</Card>
      </div>
      
      <Card className="border-none shadow-md mb-8">
        <CardHeader>
          <CardTitle>Wallet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Current Balance:</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ₹{walletBalance?.toFixed(2) || '0.00'}
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <p>
                  Publishing an article requires a fee of ₹150.00. 
                  {walletBalance !== null && walletBalance < 150
                    ? ` You need ₹${(150 - walletBalance).toFixed(2)} more to publish.`
                    : ' Your balance is sufficient for publishing!'
                  }
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
              onClick={() => navigate('/writer/wallet')}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Manage Wallet
            </Button>
          </div>
          
          {walletBalance !== null && walletBalance < 150 && (
            <div className="mt-4">
              <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Low Balance Warning</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Your wallet balance is too low to publish articles. Add funds to continue publishing.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
      
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
        
        {renderContent()}
      </div>
      
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
      
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-700 dark:text-amber-400">
              Confirm Publication Request
            </DialogTitle>
            <DialogDescription>
              You're about to request publication of "{articleToPublish?.title}". This will deduct ₹150 from your wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800 mb-4">
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">What happens next?</h4>
            <ol className="list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-300 text-sm">
              <li>₹150 will be deducted from your wallet</li>
              <li>Your article will be placed in a review queue</li>
              <li>An administrator will review it within 15 minutes</li>
              <li>You'll receive a notification once approved</li>
              <li>After approval, your article will be published publicly</li>
            </ol>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current wallet balance:</span>
            <span className="font-semibold">₹{walletBalance?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Publication fee:</span>
            <span className="font-semibold text-red-600">- ₹150.00</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2 border-gray-200 dark:border-gray-700">
            <span className="font-medium">Remaining balance after payment:</span>
            <span className="font-semibold">
              ₹{Math.max(0, (walletBalance || 0) - 150).toFixed(2)}
            </span>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPublishDialog(false)}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handlePublishConfirm}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Confirm & Pay ₹150
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}