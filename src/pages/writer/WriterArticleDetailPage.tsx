import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Edit, Trash2, Heart, BookOpen, Bookmark, Award,
  Clock, Calendar, User, ChevronRight, RefreshCw, Loader2, 
  CheckCircle, AlertCircle, DollarSign, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

import articleService, { Article } from '@/services/articleService';
import { useAuth } from '@/context/AuthContext';

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State variables
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCollectingReward, setIsCollectingReward] = useState(false);
  const [collectSuccess, setCollectSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState({
    points_earned: 0,
    uncollected_reads: 0,
    total_reads: 0
  });
  const [showRewardSuccess, setShowRewardSuccess] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState(0);
  
  // Fetch article data
  useEffect(() => {
    if (!slug) return;
    
    const fetchArticleData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const articleData = await articleService.getArticleBySlug(slug);
        setArticle(articleData);
        
        // If published, fetch earnings data
        if (articleData.status === 'published') {
          try {
            const earningsData = await fetch(`/api/articles/${articleData.id}/earnings/`).then(res => res.json());
            setEarnings(earningsData);
          } catch (err) {
            console.error('Failed to fetch earnings data:', err);
            // Use default values if API fails
          }
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticleData();
  }, [slug]);
  
  // Handle delete article
  const handleDeleteArticle = async () => {
    if (!article?.slug) return;
    
    try {
      setIsDeleting(true);
      await articleService.deleteArticle(article.slug);
      toast.success('Article deleted successfully');
      navigate('/writer/articles');
    } catch (err) {
      console.error('Error deleting article:', err);
      toast.error('Failed to delete article');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  // Handle collect rewards
  const handleCollectRewards = async () => {
    if (!article?.id) return;
    
    try {
      setIsCollectingReward(true);
      
      // Calculate reward based on uncollected reads
      const rewardPointsPerRead = 10; // Adjust based on your system
      const pointsToCollect = earnings.uncollected_reads * rewardPointsPerRead;
      
      // Call API to collect rewards
      const response = await articleService.collectReward(article.id);
      
      setCollectedAmount(pointsToCollect);
      setCollectSuccess(true);
      setShowRewardSuccess(true);
      
      // Update local state
      setEarnings(prev => ({
        ...prev,
        points_earned: prev.points_earned + prev.uncollected_reads,
        uncollected_reads: 0
      }));
      
      toast.success('Rewards collected successfully!');
    } catch (err: any) {
      console.error('Error collecting reward:', err);
      toast.error(err.message || 'Failed to collect rewards');
    } finally {
      setIsCollectingReward(false);
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      draft: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: <Edit className="h-3 w-3 mr-1" />, text: "Draft" },
      pending: { color: "bg-amber-100 text-amber-800 border-amber-300", icon: <Clock className="h-3 w-3 mr-1" />, text: "Pending Review" },
      published: { color: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle className="h-3 w-3 mr-1" />, text: "Published" },
      rejected: { color: "bg-red-100 text-red-800 border-red-300", icon: <AlertCircle className="h-3 w-3 mr-1" />, text: "Rejected" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      color: "bg-gray-100 text-gray-800 border-gray-300", 
      icon: null, 
      text: status.charAt(0).toUpperCase() + status.slice(1) 
    };
    
    return (
      <Badge className={`${config.color} flex items-center`}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-64 ml-auto" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full max-w-md mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Article</AlertTitle>
          <AlertDescription>{error || 'Article not found'}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link to="/writer/articles">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header with navigation and actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link to="/writer/articles">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          
          <StatusBadge status={article.status} />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/writer/articles/edit/${article.slug}`)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Article
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          
          {article.status === 'draft' && (
            <Button
              variant="default"
              onClick={() => navigate(`/writer/articles/edit/${article.slug}?publish=true`)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Request Publishing
            </Button>
          )}
        </div>
      </div>
      
      {/* Main article card */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">{article.title}</CardTitle>
              <CardDescription className="flex flex-wrap gap-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created: {formatDate(article.created_at)}
                </span>
                {article.published_at && (
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Published: {formatDate(article.published_at)}
                  </span>
                )}
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Author: {article.author_name}
                </span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {article.tags && article.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Total Reads</h3>
                <p className="text-3xl font-bold text-blue-700">
                  {article.total_reads || 0}
                </p>
                {article.total_reads > 0 && (
                  <Progress value={Math.min(article.total_reads, 1000) / 10} className="h-1 mt-2 w-full" />
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-pink-50 border-pink-200">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Total Likes</h3>
                <p className="text-3xl font-bold text-pink-700">
                  {article.total_likes || 0}
                </p>
                {article.total_likes > 0 && (
                  <Progress value={Math.min(article.total_likes, 100)} className="h-1 mt-2 w-full" />
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <Bookmark className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Bookmarks</h3>
                <p className="text-3xl font-bold text-purple-700">
                  {article.total_bookmarks || 0}
                </p>
                {article.total_bookmarks > 0 && (
                  <Progress value={Math.min(article.total_bookmarks, 100)} className="h-1 mt-2 w-full" />
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Earnings section */}
                {article.status === 'published' && (
                  <Card className="border-none shadow-sm bg-gradient-to-r from-amber-50 to-yellow-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center text-amber-800">
                        <Award className="h-5 w-5 mr-2 text-amber-600" />
                        Earnings & Rewards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-200">
                          <p className="text-sm text-amber-700 mb-1">Total Points Earned</p>
                          <p className="text-2xl font-bold text-amber-800">{earnings.points_earned}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-200">
                          <p className="text-sm text-amber-700 mb-1">Uncollected Reads</p>
                          <p className="text-2xl font-bold text-amber-800">{earnings.uncollected_reads}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-200">
                          <p className="text-sm text-amber-700 mb-1">Total Reads</p>
                          <p className="text-2xl font-bold text-amber-800">{earnings.total_reads}</p>
                        </div>
                      </div>
                      
                      {earnings.uncollected_reads > 0 && (
                        <div className="mt-6 flex justify-center">
                          <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={isCollectingReward}
                            onClick={handleCollectRewards}
                          >
                            {isCollectingReward ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Collect Rewards ({earnings.uncollected_reads} points)
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Article statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Article Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <StatusBadge status={article.status} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Word Count:</span>
                          <span className="font-medium">{article.word_count || 0} words</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{formatDate(article.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">{formatDate(article.updated_at)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Published:</span>
                          <span className="font-medium">{article.published_at ? formatDate(article.published_at) : 'Not published'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reader Reward:</span>
                          <span className="font-medium text-amber-600">{article.reward || 0} points</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reading Time:</span>
                          <span className="font-medium">{article.reading_time_minutes || 5} min</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Admin feedback */}
                {article.status === 'rejected' && article.admin_feedback && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Admin Feedback</AlertTitle>
                    <AlertDescription className="text-red-700 mt-2 whitespace-pre-line">
                      {article.admin_feedback}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-6">
              {/* Article content */}
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  {article.thumbnail && (
                    <img 
                      src={article.thumbnail} 
                      alt={article.title}
                      className="w-full max-h-96 object-cover rounded-lg mb-6"
                    />
                  )}
                  
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{article.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteArticle}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Article'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reward success dialog */}
      <Dialog open={showRewardSuccess} onOpenChange={setShowRewardSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center">
              <Award className="h-6 w-6 text-amber-600 mr-2" />
              Rewards Collected Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              You have collected {collectedAmount} points from this article.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 flex justify-center">
            <div className="bg-amber-50 w-full max-w-xs rounded-full p-3 flex items-center justify-center">
              <DollarSign className="h-10 w-10 text-amber-600 mr-2" />
              <span className="text-2xl font-bold text-amber-800">+{collectedAmount}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowRewardSuccess(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticleDetailPage;