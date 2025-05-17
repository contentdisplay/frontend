import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Clock, ArrowLeft, AlertCircle, Award, Share2, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import articleService from '@/services/articleService';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ArticleReadingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  const [readingStarted, setReadingStarted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [readingCompleted, setReadingCompleted] = useState(false);
  const [rewardCollected, setRewardCollected] = useState(false);
  const [isCollectingReward, setIsCollectingReward] = useState(false);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Minimum time needed to read article (in seconds)
  const minReadTime = 30; // Set to 30 seconds for testing, but typically would be higher
  
  useEffect(() => {
    if (!slug) {
      setError('Article not found');
      setIsLoading(false);
      return;
    }
    
    loadArticle();
  }, [slug]);
  
  // Timer to track reading time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (readingStarted && !readingCompleted) {
      timer = setInterval(() => {
        setReadingTime(prevTime => {
          const newTime = prevTime + 1;
          const progress = Math.min(100, (newTime / minReadTime) * 100);
          setReadingProgress(progress);
          
          if (newTime >= minReadTime) {
            setReadingCompleted(true);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [readingStarted, readingCompleted]);
  
  const loadArticle = async () => {
    try {
      setIsLoading(true);
      const response = await articleService.getArticleBySlug(slug!);
      setArticle(response);
      setIsAuthor(user?.id === response.author);
      setLiked(response.is_liked || false);
      setLikeCount(response.likes_count || response.total_likes || 0);
      
      if (!isAuthor && response.status === 'published') {
        startReadingArticle(response.id);
      }
    } catch (error) {
      console.error('Failed to load article:', error);
      setError('Failed to load article. It may have been removed or is not publicly available.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startReadingArticle = async (articleId: number) => {
    try {
      const readingState = await articleService.startReading(articleId);
      setReadingStarted(true);
      setRewardCollected(readingState.is_rewarded || false);
    } catch (error) {
      console.error('Failed to record reading activity:', error);
      // Still allow reading even if tracking fails
      setReadingStarted(true);
    }
  };
  
  const handleCollectReward = async () => {
    if (!article || isAuthor || !readingCompleted || rewardCollected) return;
    
    try {
      setIsCollectingReward(true);
      const result = await articleService.collectReward(article.id);
      
      setRewardCollected(true);
      setRewardAmount(result.reward_points || 0.5);
      setShowRewardDialog(true);
    } catch (error: any) {
      console.error('Failed to collect reward:', error);
      
      let message = 'Failed to collect reward';
      
      if (error.message) {
        message = error.message;
      } else if (error.response?.data?.detail) {
        message = error.response.data.detail;
      }
      
      toast.error(message);
    } finally {
      setIsCollectingReward(false);
    }
  };
  
  const handleLikeArticle = async () => {
    if (!article || isLiking) return;
    
    try {
      setIsLiking(true);
      await articleService.toggleLike(article.id);
      
      const newLikedState = !liked;
      setLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
      
      toast.success(newLikedState ? 'Article liked!' : 'Article unliked');
    } catch (error) {
      console.error('Failed to like article:', error);
      toast.error('Failed to update like status');
    } finally {
      setIsLiking(false);
    }
  };
  
  const formatReadingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }
  
  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Article not found'}</AlertDescription>
        </Alert>
        
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      {/* Article Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {new Date(article.published_at || article.created_at).toLocaleDateString()}
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <BookOpen className="h-4 w-4 mr-1" />
            {article.word_count || 0} words
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            By {article.author_name}
          </div>
        </div>
        
        {article.thumbnail && (
          <div className="w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden mb-6">
            <img 
              src={article.thumbnail} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      {/* Reading Progress Bar (for non-authors) */}
      {readingStarted && !isAuthor && (
        <Card className="mb-6 border-none shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="font-medium text-blue-800 dark:text-blue-300">
                  Reading Time: {formatReadingTime(readingTime)}
                </span>
              </div>
              
              {readingCompleted ? (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Reading Completed
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                  <Clock className="h-3 w-3 mr-1" />
                  Reading in Progress
                </Badge>
              )}
            </div>
            
            <Progress value={readingProgress} className="h-2 mb-2" />
            
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {readingCompleted 
                ? 'You have read this article for the minimum required time. You can now collect your reward!'
                : `Keep reading for ${formatReadingTime(Math.max(0, minReadTime - readingTime))} more to earn reward points.`
              }
            </div>
            
            {readingCompleted && !rewardCollected && (
              <Button 
                className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={handleCollectReward}
                disabled={isCollectingReward}
              >
                {isCollectingReward ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    Collect Reward Points
                  </>
                )}
              </Button>
            )}
            
            {rewardCollected && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md border border-green-200 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                You have already collected the reward for this article!
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Article Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
      
      {/* Article Actions */}
      <div className="flex flex-wrap gap-4 py-6 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="outline"
          className={`flex items-center ${liked ? 'bg-pink-50 text-pink-700 border-pink-300 hover:bg-pink-100' : 'text-gray-700 dark:text-gray-300'}`}
          onClick={handleLikeArticle}
          disabled={isLiking}
        >
          <Heart className={`mr-2 h-4 w-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
          {isLiking ? 'Processing...' : liked ? 'Liked' : 'Like'} ({likeCount})
        </Button>
        
        <Button
          variant="outline"
          className="text-gray-700 dark:text-gray-300"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Article link copied to clipboard!');
          }}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        
        {!isAuthor && readingCompleted && !rewardCollected && (
          <Button 
            className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            onClick={handleCollectReward}
            disabled={isCollectingReward}
          >
            {isCollectingReward ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Award className="mr-2 h-4 w-4" />
                Collect Reward
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Reward Collection Dialog */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center">
              <Award className="h-6 w-6 text-amber-500 mr-2" />
              Reward Collected!
            </DialogTitle>
            <DialogDescription className="text-center">
              Thank you for reading this article. Your reward has been added to your wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-800 font-medium">You've earned</p>
              <p className="text-3xl font-bold text-amber-600 my-2">₹{rewardAmount.toFixed(2)}</p>
              <p className="text-amber-700 text-sm">reward points</p>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Continue reading articles to earn more rewards. You can convert reward points to wallet balance from your wallet page.
            </p>
          </div>
          
          <DialogFooter className="flex justify-center">
            <Button 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              onClick={() => {
                setShowRewardDialog(false);
                navigate('/articles');
              }}
            >
              Find More Articles to Read
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}