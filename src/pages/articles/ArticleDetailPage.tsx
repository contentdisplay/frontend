// Updated ArticleDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Heart, Bookmark, ArrowLeft, Calendar, Clock, User, Tag, Award, Share2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import articleService, { Article, ArticleReadingState } from '@/services/articleService';
import writerEarningsService from '@/services/writerEarningsService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
// import { ArticleRewardSection } from '@/components/articles/ArticleRewardSection';
import { ArticleStats } from '@/components/articles/ArticleStats';
import { WriterRewardsSection } from '@/components/articles/WriterRewardSection';
import { useViewport } from '@/hooks/use-viewport';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingStartTime, setReadingStartTime] = useState<Date | null>(null);
  const [isReadingComplete, setIsReadingComplete] = useState(false);
  const [isRewardClaimed, setIsRewardClaimed] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Writer specific states
  const [isArticleOwner, setIsArticleOwner] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [uncollectedReads, setUncollectedReads] = useState(0);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);

  const { isInViewport } = useViewport();
  
  // Reading tracking timer
  const calculateRequiredReadingTime = (wordCount: number) => {
    const wordsPerMinute = 200;
    // Calculate reading time in minutes, minimum 1 minute, maximum 15 minutes
    const calculatedMinutes = Math.min(15, Math.max(1, Math.ceil(wordCount / wordsPerMinute)));
    return calculatedMinutes * 60; // Convert to seconds
  };
  
  const readingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const readingCheckpointRef = useRef<Date | null>(null);
  const rewardAmount = 50; // The fixed reward amount
  
  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        const data = await articleService.getArticleBySlug(slug);
        setArticle(data);
        setIsLiked(data.is_liked || false);
        setIsBookmarked(data.is_bookmarked || false);
        setLikesCount(data.likes_count || data.total_likes || 0);
        setBookmarksCount(data.bookmarks_count || data.total_bookmarks || 0);
        
        // Check if current user is the article owner
        if (user && data.author) {
          const isOwner = user.id === data.author || 
                         (typeof data.author === 'object' && user.id === data.author.id);
          setIsArticleOwner(isOwner);
          
          // If user is the article owner, fetch earnings data
          if (isOwner) {
            fetchArticleEarnings(data.id);
          }
        }
        
        // Calculate reading time
        const wordsPerMinute = 200;
        const calculatedReadingTime = Math.max(1, Math.ceil((data.word_count || 0) / wordsPerMinute));
        setReadingTime(calculatedReadingTime);
        
        // Start reading timer
        if (data.status === 'published') {
          startReading(data.id);
        }
      } catch (error) {
        console.error('Failed to fetch article:', error);
        setErrorMessage('Failed to load article. Please try again later.');
        toast.error('Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
    
    // Clean up reading timer on unmount
    return () => {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
    };
  }, [slug, user]);
  
  // Fetch article earnings data for writers
  const fetchArticleEarnings = async (articleId: number) => {
    if (!user || !articleId) return;
    
    try {
      setIsLoadingEarnings(true);
      const earningsData = await writerEarningsService.getArticleEarnings(articleId);
      
      setEarnedPoints(earningsData.points_earned || 0);
      setUncollectedReads(earningsData.uncollected_reads || 0);
    } catch (error) {
      console.error('Failed to fetch article earnings:', error);
      // Don't show toast for this error to avoid confusion
    } finally {
      setIsLoadingEarnings(false);
    }
  };
  
  // Handle collecting rewards for writers
  const handleCollectWriterRewards = async () => {
    if (!article || !user) return;
    
    try {
      const response = await writerEarningsService.collectRewards(article.id);
      
      // Update local state
      setEarnedPoints(prev => prev + response.points_collected);
      setUncollectedReads(0);
      
      toast.success(`Successfully collected ${response.points_collected} reward points!`);
      
      return response;
    } catch (error: any) {
      console.error('Failed to collect rewards:', error);
      toast.error(error.message || 'Failed to collect rewards');
      throw error;
    }
  };
  
  const startReading = async (articleId: number) => {
    try {
      const response = await articleService.startReading(articleId);
      
      // Set the starting time from the backend response
      const startTime = new Date(response.start_time);
      setReadingStartTime(startTime);
      readingCheckpointRef.current = startTime;
      
      // Check if the reward has already been claimed
      setIsRewardClaimed(response.is_rewarded);
      
      // Start the reading progress timer
      startReadingProgressTimer();
    } catch (error) {
      console.error('Failed to start reading:', error);
      // Don't show error to user for this, just try to continue
    }
  };
  
  const startReadingProgressTimer = () => {
    // Clear any existing timer
    if (readingTimerRef.current) {
      clearInterval(readingTimerRef.current);
    }
    
    if (!article) return;
    
    // Calculate required reading time based on article word count
    const timeRequiredSeconds = calculateRequiredReadingTime(article.word_count || 0);
    
    // Start a new timer that updates every second
    readingTimerRef.current = setInterval(() => {
      if (!readingStartTime || !readingCheckpointRef.current) return;
      
      // Only increment reading time if the article is currently in view
      const articleInView = isInViewport(contentRef.current);
      
      if (articleInView) {
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - readingCheckpointRef.current.getTime()) / 1000);
        const totalElapsedSeconds = Math.floor((now.getTime() - readingStartTime.getTime()) / 1000);
        
        // Calculate progress percentage
        const progress = Math.min(100, (totalElapsedSeconds / timeRequiredSeconds) * 100);
        setReadingProgress(progress);
        
        // Check if reading is complete
        if (totalElapsedSeconds >= timeRequiredSeconds && !isReadingComplete) {
          setIsReadingComplete(true);
          // Add a visual indicator or notification that the reward is ready to be claimed
          toast.success("You've completed reading! Claim your reward now.");
        }
      } else {
        // Update the checkpoint time when the article isn't in view
        readingCheckpointRef.current = new Date();
      }
    }, 1000);
  };
  
  const handleClaimReward = async () => {
    if (!article || isClaimingReward || !isReadingComplete || isRewardClaimed) return;
    
    try {
      setIsClaimingReward(true);
      setErrorMessage(null);
      
      // Make sure we're passing the article ID correctly
      const response = await articleService.collectReward(article.id);
      
      setIsRewardClaimed(true);
      
      // Calculate dynamic reward based on reading time (in minutes)
      const requiredTime = Math.ceil(calculateRequiredReadingTime(article.word_count || 0) / 60);
      // Reward is proportional to reading time, with a minimum of 5 points and maximum of 50
      const dynamicReward = Math.min(50, Math.max(5, requiredTime * 5));
      
      toast.success(`🎉 Reward of ${dynamicReward} points added to your wallet!`);
      
      // If this user is also the writer, refresh earnings data
      if (isArticleOwner && article) {
        fetchArticleEarnings(article.id);
      }
    } catch (error: any) {
      console.error('Failed to claim reward:', error);
      
      let message = 'Failed to claim reward. Please try again.';
      if (error.response?.data?.detail) {
        message = error.response.data.detail;
        
        // Special handling for common errors
        if (message.includes('Reward already collected')) {
          setIsRewardClaimed(true);
          message = 'You have already collected the reward for this article.';
        } else if (message.includes('Must read for')) {
          const requiredMinutes = Math.ceil(calculateRequiredReadingTime(article.word_count || 0) / 60);
          message = `You need to read the article for at least ${requiredMinutes} minutes to claim the reward.`;
        }
      }
      
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsClaimingReward(false);
    }
  };
  
  const handleLike = async () => {
    if (!article || isLikeLoading) return;
    
    try {
      setIsLikeLoading(true);
      
      await articleService.toggleLike(article.id);
      
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
      
      toast.success(newLikedState ? 'Article liked' : 'Article unliked');
      
      // If article is liked and writer is viewing their own article, refresh earnings data
      if (newLikedState && isArticleOwner && article) {
        fetchArticleEarnings(article.id);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like status');
    } finally {
      setIsLikeLoading(false);
    }
  };
  
  const handleBookmark = async () => {
    if (!article || isBookmarkLoading) return;
    
    try {
      setIsBookmarkLoading(true);
      
      await articleService.toggleBookmark(article.id);
      
      const newBookmarkedState = !isBookmarked;
      setIsBookmarked(newBookmarkedState);
      setBookmarksCount(prev => newBookmarkedState ? prev + 1 : Math.max(0, prev - 1));
      
      toast.success(newBookmarkedState ? 'Article bookmarked' : 'Bookmark removed');
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      toast.error('Failed to update bookmark status');
    } finally {
      setIsBookmarkLoading(false);
    }
  };
  
  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: `Check out this article: ${article.title}`,
        url: window.location.href,
      })
      .then(() => toast.success('Article shared successfully'))
      .catch((error) => console.error('Error sharing article:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Article link copied to clipboard'))
        .catch(() => toast.error('Failed to copy article link'));
    }
  };
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-2/3 mb-4" />
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-64 w-full mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }
  
  if (errorMessage && !article) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Article</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>
            <Button
              variant="default"
              onClick={() => navigate('/articles')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!article) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/articles')}
            className="text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="h-9 w-9 rounded-full"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share Article</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-9 w-9 rounded-full', isBookmarked && 'text-indigo-600')}
                    onClick={handleBookmark}
                    disabled={isBookmarkLoading}
                  >
                    <Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-current')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('h-9 w-9 rounded-full', isLiked && 'text-rose-500')}
                    onClick={handleLike}
                    disabled={isLikeLoading}
                  >
                    <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
                    <span className="sr-only">Like</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLiked ? 'Unlike Article' : 'Like Article'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags && article.tags.map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                {tag}
              </Badge>
            ))}
            
            {article.reward && article.reward > 0 && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Award className="mr-1 h-3 w-3" /> ₹{article.reward} Reward
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>By {article.author_name}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(article.published_at || article.created_at)}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{readingTime} min read</span>
            </div>
            
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              <span>{likesCount} likes</span>
            </div>
            
            <div className="flex items-center">
              <Bookmark className="h-4 w-4 mr-1" />
              <span>{bookmarksCount} bookmarks</span>
            </div>
          </div>
        </div>
        
        {/* Featured Image */}
        {article.thumbnail && (
          <div className="mb-8">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-auto rounded-lg object-cover max-h-96"
            />
          </div>
        )}
        
        {/* Writer Rewards Section - Only visible to the article owner */}
        {isArticleOwner && (
          <WriterRewardsSection
            articleId={article.id}
            totalReads={article.total_reads || 0}
            totalLikes={likesCount}
            totalBookmarks={bookmarksCount}
            earnedPoints={earnedPoints}
            uncollectedReads={uncollectedReads}
            isOwner={isArticleOwner}
            onCollectReward={handleCollectWriterRewards}
          />
        )}
        
        {/* Reader Reward Section - Visible to readers but not to the writer */}
        {article.status === 'published' && !isArticleOwner && (
          <div className="mb-8">
            <ArticleRewardSection
              articleTitle={article.title}
              rewardAmount={rewardAmount}
              wordCount={article.word_count || 0}
              readingProgress={readingProgress}
              readingStartTime={readingStartTime}
              isReadingComplete={isReadingComplete}
              isRewardClaimed={isRewardClaimed}
              isClaimingReward={isClaimingReward}
              onClaimReward={handleClaimReward}
              errorMessage={errorMessage || undefined}
            />
          </div>
        )}
        
        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <div 
              ref={contentRef}
              className="prose prose-indigo dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        </Card>
        
        {/* Article Stats */}
        <div className="mb-8">
          <ArticleStats
            reads={article.total_reads}
            likes={likesCount}
            bookmarks={bookmarksCount}
          />
        </div>
        
        {/* Actions Footer */}
        <Card className="mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">
                  Enjoyed this article?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show your appreciation and earn rewards.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className={cn(
                    'border-2',
                    isLiked ? 'border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-900/20' : ''
                  )}
                  onClick={handleLike}
                  disabled={isLikeLoading}
                >
                  <Heart className={cn('mr-2 h-5 w-5', isLiked && 'fill-current')} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                
                <Button
                  variant="outline"
                  className={cn(
                    'border-2',
                    isBookmarked ? 'border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : ''
                  )}
                  onClick={handleBookmark}
                  disabled={isBookmarkLoading}
                >
                  <Bookmark className={cn('mr-2 h-5 w-5', isBookmarked && 'fill-current')} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Back to Articles */}
        <div className="text-center">
          <Button 
            variant="default" 
            onClick={() => navigate('/articles')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </div>
      </div>
    </motion.div>
  );
}