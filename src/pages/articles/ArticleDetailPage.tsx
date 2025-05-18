import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Heart, Bookmark, Award, Clock, 
  Calendar, User, CheckCircle, AlertCircle, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import articleService, { Article, ArticleReadingState } from '@/services/articleService';
import walletService from '@/services/walletService';
import { useAuth } from '@/context/AuthContext';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const contentRef = useRef(null);
  
  // State variables
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [error, setError] = useState(null);
  
  // Reading timer states
  const [readingStarted, setReadingStarted] = useState(false);
  const [readingState, setReadingState] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeRequired, setTimeRequired] = useState(15 * 60); // Default 15 minutes in seconds
  const [canCollectReward, setCanCollectReward] = useState(false);
  const [isCollectingReward, setIsCollectingReward] = useState(false);
  const timerRef = useRef(null);
  
  // Reward dialog states
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [giftAmount, setGiftAmount] = useState(5);
  const [isGifting, setIsGifting] = useState(false);
  const [rewardCollected, setRewardCollected] = useState(false);
  const [collectedPoints, setCollectedPoints] = useState(0);
  
  // User wallet state
  const [userWalletBalance, setUserWalletBalance] = useState(0);
  
  // Fetch article data
  useEffect(() => {
    if (!slug) return;
    
    const fetchArticleData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get article details
        const articleData = await articleService.getArticleBySlug(slug);
        setArticle(articleData);
        
        // Set initial states
        setIsLiked(!!articleData.is_liked);
        setIsBookmarked(!!articleData.is_bookmarked);
        
        // Set time required based on the article's reading_time_minutes
        if (articleData.reading_time_minutes) {
          setTimeRequired(articleData.reading_time_minutes * 60);
        }
        
        // Check if user has already started reading this article
        // This could be expanded by fetching reading state from backend
        
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticleData();
    
    // Fetch user wallet info
    fetchUserWallet();
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [slug]);
  
  // Fetch user wallet info
  const fetchUserWallet = async () => {
    try {
      const walletInfo = await walletService.getWalletInfo();
      setUserWalletBalance(parseFloat(walletInfo.reward_points));
    } catch (err) {
      console.error('Error fetching wallet info:', err);
    }
  };
  
  // Start reading timer
  const startReading = async () => {
    if (!article || !article.id) return;
    
    try {
      // Call API to start reading session
      const response = await articleService.startReading(article.id);
      setReadingState(response);
      setReadingStarted(true);
      
      // Set timer based on article's reading time
      const requiredSeconds = article.reading_time_minutes * 60;
      setTimeRequired(requiredSeconds);
      setTimeLeft(requiredSeconds);
      
      // Check if already rewarded
      if (response.is_rewarded) {
        setCanCollectReward(false);
        setRewardCollected(true);
        toast.info('You have already collected rewards for this article');
      } else {
        // Start countdown timer
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev === null) return null;
            if (prev <= 1) {
              // Timer completed
              if (timerRef.current) clearInterval(timerRef.current);
              setCanCollectReward(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      console.error('Error starting reading session:', err);
      
      // Continue with reading functionality even if backend call fails
      setReadingStarted(true);
      const requiredSeconds = article.reading_time_minutes * 60;
      setTimeRequired(requiredSeconds);
      setTimeLeft(requiredSeconds);
      
      // Start countdown timer anyway
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            // Timer completed
            if (timerRef.current) clearInterval(timerRef.current);
            setCanCollectReward(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Show a warning message
      toast.warning('Reading started, but your progress may not be saved. Please try again later.');
    }
  };
  
  // Format time for display
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Toggle like
  const handleToggleLike = async () => {
    if (!article || !article.id) return;
    
    try {
      await articleService.toggleLike(article.id);
      setIsLiked(!isLiked);
      
      // Update article's like count
      setArticle((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          total_likes: isLiked ? prev.total_likes - 1 : prev.total_likes + 1
        };
      });
      
      toast.success(isLiked ? 'Removed like' : 'Added like');
    } catch (err) {
      console.error('Error toggling like:', err);
      toast.error('Failed to update like status');
    }
  };
  
  // Toggle bookmark
  const handleToggleBookmark = async () => {
    if (!article || !article.id) return;
    
    try {
      await articleService.toggleBookmark(article.id);
      setIsBookmarked(!isBookmarked);
      
      // Update article's bookmark count
      setArticle((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          total_bookmarks: isBookmarked ? prev.total_bookmarks - 1 : prev.total_bookmarks + 1
        };
      });
      
      toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      toast.error('Failed to update bookmark status');
    }
  };
  
  // Collect reward
  const handleCollectReward = async () => {
    if (!article || !article.id) return;
    
    try {
      setIsCollectingReward(true);
      
      // Call API to collect reward
      const response = await articleService.collectReward(article.id);
      
      // Set reward collected
      setRewardCollected(true);
      setCanCollectReward(false);
      
      // Set collected points using points_collected from response or fallback to article's value
      const pointsCollected = response.points_collected || article.collectable_reward_points || 50;
      setCollectedPoints(pointsCollected);
      
      // Refresh wallet balance
      await fetchUserWallet();
      
      // Show reward dialog
      setShowRewardDialog(true);
      
      toast.success(`Successfully collected ${pointsCollected} reward points!`);
    } catch (err) {
      console.error('Error collecting reward:', err);
      let errorMessage = 'Failed to collect reward';
      
      // Get error message from response if available
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      
      // If reading time not sufficient, show minutes required
      if (err.response?.data?.required_minutes) {
        toast.info(`You need to read for at least ${err.response.data.required_minutes} minutes to collect a reward.`);
      }
    } finally {
      setIsCollectingReward(false);
    }
  };
  
  // Show gift dialog with updated wallet info
  const showGiftDialogWithWallet = async () => {
    await fetchUserWallet();
    setShowGiftDialog(true);
  };
  
  // Handle gifting points to the writer
  // Handle gifting points to the writer
const handleGiftPoints = async () => {
  if (!article || !article.id) return;
  
  try {
    // Check if user has sufficient balance
    if (userWalletBalance < giftAmount) {
      toast.error(`Insufficient reward points. You have ${userWalletBalance} points but trying to gift ${giftAmount} points.`);
      return;
    }
    
    setIsGifting(true);
    
    // Call API to gift points
    const response = await walletService.giftPoints({
      recipient_id: article.author,
      amount: giftAmount,
      article_id: article.id,
      message: `Gift for article: ${article.title}`
    });
    
    // Update wallet balance after gifting
    await fetchUserWallet();
    
    // Close gift dialog
    setShowGiftDialog(false);
    
    toast.success(`Successfully gifted ${giftAmount} points to the writer! Your remaining balance: ${response.remaining_balance || userWalletBalance - giftAmount} points`);
  } catch (err) {
    console.error('Error gifting points:', err);
    const errorMessage = err.response?.data?.detail || 'Failed to gift points. Please try again.';
    toast.error(errorMessage);
    
    // If error is due to insufficient balance, fetch wallet and update balance
    if (errorMessage.includes('Insufficient reward points')) {
      await fetchUserWallet();
    }
  } finally {
    setIsGifting(false);
  }
};
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            <div className="mb-8">
              <Skeleton className="h-64 w-full" />
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
            <Link to="/articles">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with navigation and actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link to="/articles">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleLike}
            className={`${isLiked ? 'bg-pink-100 text-pink-700 border-pink-300' : ''}`}
          >
            <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleBookmark}
            className={`${isBookmarked ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : ''}`}
          >
            <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? 'fill-indigo-500 text-indigo-500' : ''}`} />
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
        </div>
      </div>
      
      {/* Main article card */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="w-full">
              <CardTitle className="text-2xl font-bold mb-2">{article.title}</CardTitle>
              <CardDescription className="flex flex-wrap gap-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Published: {formatDate(article.published_at)}
                </span>
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
          {/* Reading Timer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Reading Time: {article.reading_time_minutes} minutes
                </h3>
                <p className="text-blue-700 text-sm mt-1">
                  Read for {article.reading_time_minutes} minutes to earn {article.collectable_reward_points || 50} reward points!
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                {!readingStarted ? (
                  <Button
                    onClick={startReading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Start Reading
                  </Button>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-1">
                      {formatTime(timeLeft)}
                    </div>
                    <p className="text-sm text-blue-600">
                      {timeLeft === 0 ? 'Reading time completed!' : 'Time remaining'}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                {readingStarted && (
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={!canCollectReward || isCollectingReward || rewardCollected}
                    onClick={handleCollectReward}
                  >
                    {isCollectingReward ? (
                      'Processing...'
                    ) : rewardCollected ? (
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reward Collected
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        Collect Reward
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Progress bar for reading time */}
            {readingStarted && timeLeft !== null && timeRequired > 0 && (
              <div className="mt-4">
                <Progress
                  value={((timeRequired - timeLeft) / timeRequired) * 100}
                  className="h-2"
                />
                <p className="text-xs text-blue-700 mt-1 text-center">
                  {Math.round(((timeRequired - timeLeft) / timeRequired) * 100)}% complete
                </p>
              </div>
            )}
          </div>
          
          {/* Article thumbnail */}
          {article.thumbnail && (
            <div className="mb-6">
              <img 
                src={article.thumbnail} 
                alt={article.title} 
                className="w-full max-h-96 object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Article stats */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1">
              <Heart className="h-5 w-5 text-pink-500" />
              <span className="font-medium">{article.total_likes || 0} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="h-5 w-5 text-indigo-500" />
              <span className="font-medium">{article.total_bookmarks || 0} bookmarks</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-5 w-5 text-amber-500" />
              <span className="font-medium">{article.collectable_reward_points || 50} reward points</span>
            </div>
          </div>
          
          {/* Article content */}
          <div 
            ref={contentRef}
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col items-center pt-6 pb-6 gap-4">
          {rewardCollected ? (
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={showGiftDialogWithWallet}
            >
              <Gift className="h-4 w-4 mr-2" />
              Gift Points to Writer
            </Button>
          ) : (
            <p className="text-gray-500 italic">
              Complete reading to collect rewards and gift the writer
            </p>
          )}
        </CardFooter>
      </Card>
      
      {/* Reward Collection Dialog */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-amber-600" />
              Congratulations!
            </DialogTitle>
            <DialogDescription className="text-center pt-4">
              You've earned {collectedPoints} reward points for reading this article!
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 text-center">
            <div className="bg-amber-50 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-amber-600">+{collectedPoints}</span>
            </div>
            
            <p className="text-gray-700">
              These points have been added to your wallet. You can use them for various rewards or convert them to your wallet balance.
            </p>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => {
                setShowRewardDialog(false);
                showGiftDialogWithWallet();
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Gift className="mr-2 h-4 w-4" />
              Gift to Writer
            </Button>
            
            <Button 
              onClick={() => setShowRewardDialog(false)}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Gift Points Dialog */}
      <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Gift className="h-6 w-6 text-purple-600" />
              Gift Points to Writer
            </DialogTitle>
            <DialogDescription className="text-center pt-4">
              Enjoyed this article? Show your appreciation by gifting points to {article.author_name}!
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <RadioGroup 
              value={giftAmount.toString()} 
              onValueChange={(value) => setGiftAmount(parseInt(value, 10))}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="5"
                  id="gift-5"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="gift-5"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gray-50 p-4 hover:bg-gray-100 hover:border-purple-200 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 cursor-pointer"
                >
                  <span className="text-2xl font-bold">5</span>
                  <span className="text-xs text-gray-500">Good</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem
                  value="10"
                  id="gift-10"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="gift-10"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gray-50 p-4 hover:bg-gray-100 hover:border-purple-200 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 cursor-pointer"
                >
                  <span className="text-2xl font-bold">10</span>
                  <span className="text-xs text-gray-500">Great</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem
                  value="15"
                  id="gift-15"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="gift-15"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gray-50 p-4 hover:bg-gray-100 hover:border-purple-200 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 cursor-pointer"
                >
                  <span className="text-2xl font-bold">15</span>
                  <span className="text-xs text-gray-500">Excellent</span>
                </Label>
              </div>
            </RadioGroup>
            
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Your current reward points: <span className="font-semibold text-purple-600">{userWalletBalance}</span>
              </p>
              {userWalletBalance < giftAmount && (
                <p className="text-red-500 text-sm mt-2">
                  Insufficient reward points for this gift amount
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleGiftPoints}
              disabled={isGifting || userWalletBalance < giftAmount}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGifting ? (
                'Processing...'
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Send {giftAmount} Points
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => setShowGiftDialog(false)}
              variant="outline"
              className="w-full"
              disabled={isGifting}
            >
              Skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticleDetailPage;