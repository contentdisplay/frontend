// pages/articles/ArticleDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Heart, 
  Share, 
  Bookmark, 
  Clock, 
  Tag, 
  Wallet, 
  User, 
  Loader2, 
  Edit, 
  Trash,
  Info
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import articleService, { Article } from '@/services/articleService';
import walletService from '@/services/walletService';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ArticleRewardSection } from '@/components/articles/ArticleRewardSection';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTimeSeconds, setReadingTimeSeconds] = useState(0);
  const [isReadingStarted, setIsReadingStarted] = useState(false);
  const [isReadingComplete, setIsReadingComplete] = useState(false);
  const [isRewardClaimed, setIsRewardClaimed] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isOwnArticle = article && user?.username === article.author;

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        const data = await articleService.getArticleBySlug(slug);
        setArticle(data);
        setLikesCount(data.likes_count);
        setBookmarksCount(data.bookmarks_count);
        setIsLiked(data.is_liked);
        setIsBookmarked(data.is_bookmarked);

        // Check if reward is already claimed
        const hasCollected = await checkRewardStatus(data);
        setIsRewardClaimed(hasCollected);
        
        // Get user's multiplier from wallet
        try {
          const userProfile = await walletService.getUserProfile();
          if (userProfile && userProfile.multiplier) {
            setMultiplier(userProfile.multiplier);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } catch (error) {
        console.error('Failed to fetch article:', error);
        setError('Article not found or has been removed.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [slug]);

  const checkRewardStatus = async (article: Article) => {
    try {
      const response = await articleService.collectReward(article.slug, 0);
      return false; // This should not succeed
    } catch (error: any) {
      if (error.detail && error.detail.includes('already collected')) {
        return true;
      }
      return false;
    }
  };

  const handleStartReading = () => {
    if (isReadingStarted) return;
    setIsReadingStarted(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsedMs = Date.now() - (startTimeRef.current || Date.now());
      const seconds = Math.floor(elapsedMs / 1000);
      setReadingTimeSeconds(seconds);

      // Calculate required reading time (minimum 5 minutes or 90% of estimated time)
      const estimatedTimeSeconds = (article?.word_count || 500) / 200 * 60;
      const requiredTimeSeconds = Math.max(300, estimatedTimeSeconds * 0.9); // minimum 5 minutes
      
      if (seconds >= requiredTimeSeconds) {
        setIsReadingComplete(true);
        setReadingProgress(100);
      } else {
        setReadingProgress((seconds / requiredTimeSeconds) * 100);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!article || !isReadingStarted || isReadingComplete) return;

    const handleScroll = () => {
      if (!contentRef.current) return;
      const element = contentRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      const scrollPosition = element.scrollTop;
      const scrollPercentage = Math.min(100, Math.ceil((scrollPosition / totalHeight) * 100));
      
      const estimatedTimeSeconds = (article?.word_count || 500) / 200 * 60;
      const requiredTimeSeconds = Math.max(300, estimatedTimeSeconds * 0.9); // minimum 5 minutes
      
      if (scrollPercentage >= 90 && readingTimeSeconds >= requiredTimeSeconds) {
        setIsReadingComplete(true);
        setReadingProgress(100);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [article, isReadingStarted, isReadingComplete, readingTimeSeconds]);

  const handleLike = async () => {
    if (!slug) return;
    try {
      await articleService.toggleLike(slug);
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
      toast.success(isLiked ? 'Article unliked' : 'Article liked');
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleBookmark = async () => {
    if (!slug) return;
    try {
      await articleService.toggleBookmark(slug);
      setIsBookmarked(!isBookmarked);
      setBookmarksCount((prev) => (isBookmarked ? prev - 1 : prev + 1));
      toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      toast.error('Failed to update bookmark status');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title || 'Article',
          text: article?.description || 'Check out this article',
          url: window.location.href,
        })
        .then(() => toast.success('Article shared successfully'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleClaimReward = async () => {
    if (!slug || !article || !isReadingComplete || isRewardClaimed) return;

    try {
      setIsClaimingReward(true);
      const response = await articleService.collectReward(slug, readingTimeSeconds);
      
      // Add rewards to wallet
      try {
        await walletService.addRewards(article.title, slug, response.reward);
      } catch (error) {
        console.error("Failed to update wallet rewards:", error);
      }
      
      setIsRewardClaimed(true);
      toast.success(`Reward claimed: ₹${response.reward.toFixed(2)}`);
    } catch (error: any) {
      toast.error(error.detail || 'Failed to claim reward');
    } finally {
      setIsClaimingReward(false);
    }
  };

  const handleDelete = async () => {
    if (!slug) return;
    try {
      await articleService.deleteArticle(slug);
      toast.success('Article deleted successfully');
      navigate('/writer/dashboard');
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  const getReadTime = () => {
    if (!article) return 0;
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(article.word_count / wordsPerMinute));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Article not found'}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          asChild
          className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900"
        >
          <Link to="/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="ghost"
            asChild
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
          >
            <Link to="/articles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Link>
          </Button>
          {isOwnArticle && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/writer/articles/edit/${slug}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-2">
          <Progress
            value={readingProgress}
            className="h-1 bg-gray-200 dark:bg-gray-700"
            indicatorClassName="bg-gradient-to-r from-amber-400 to-orange-500"
          />
        </div>

        <article className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {article.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{getReadTime()} min read</span>
              </div>
              <div>
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
            </div>
          </div>

          {article.thumbnail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {!isReadingStarted && (
            <div className="text-center">
              <Button
                onClick={handleStartReading}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
              >
                Start Reading
              </Button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-gray-600 dark:text-gray-300 font-medium"
          >
            {article.description}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            ref={contentRef}
            className="prose max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-base prose-blockquote:border-l-indigo-600 prose-blockquote:text-gray-600 dark:prose-blockquote:border-l-indigo-400 dark:prose-blockquote:text-gray-400 prose-blockquote:not-italic overflow-auto max-h-[60vh] bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="flex flex-wrap justify-between items-center border-t border-b py-4 border-gray-200 dark:border-gray-700 gap-y-4">
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}
                    >
                      <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likesCount} Likes</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isLiked ? 'Unlike this article' : 'Like this article'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBookmark}
                      className={isBookmarked ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}
                    >
                      <Bookmark className={`mr-1 h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      <span>{bookmarksCount} Saves</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      <Share className="mr-1 h-4 w-4" />
                      <span>Share</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this article</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {!isOwnArticle && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isReadingComplete ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleClaimReward}
                      disabled={!isReadingComplete || isRewardClaimed || isClaimingReward}
                      className={
                        isReadingComplete && !isRewardClaimed
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white animate-pulse'
                          : 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                      }
                    >
                      {isClaimingReward ? (
                        <>
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          <span>Claiming...</span>
                        </>
                      ) : isRewardClaimed ? (
                        <>
                          <Wallet className="mr-1 h-4 w-4" />
                          <span>Reward Claimed</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-1 h-4 w-4" />
                          <span>
                            {isReadingComplete
                              ? `Claim ₹${(article.reward * multiplier).toFixed(2)} Reward`
                              : `Read to earn ₹${(article.reward * multiplier).toFixed(2)}`}
                          </span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isRewardClaimed 
                        ? 'You have already claimed the reward for this article' 
                        : isReadingComplete 
                          ? 'Claim your reward for reading this article' 
                          : 'Complete reading to earn rewards'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {!isOwnArticle && (
            <ArticleRewardSection
              articleTitle={article.title}
              rewardAmount={article.reward}
              readingProgress={readingProgress}
              isReadingComplete={isReadingComplete}
              isRewardClaimed={isRewardClaimed}
              isClaimingReward={isClaimingReward}
              onClaimReward={handleClaimReward}
              multiplier={multiplier}
            />
          )}

          {/* Article stats for authors */}
          {isOwnArticle && (
            <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Article Statistics</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reads</p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{article.normal_user_reads}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Likes</p>
                    <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{likesCount}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bookmarks</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{bookmarksCount}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rewards Claimed</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{article.rewards_collected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </article>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Article</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{article.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}