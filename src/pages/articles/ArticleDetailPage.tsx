// pages/articles/ArticleDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Share, Bookmark, Clock, Tag, Wallet, User, Loader2, Edit, Trash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import articleService, { Article } from '@/services/articleService';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
      return response.detail.includes('already collected');
    } catch (error) {
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

      const requiredTime = (article?.word_count || 500) / 200 * 60;
      if (seconds >= requiredTime * 0.9) {
        setIsReadingComplete(true);
        setReadingProgress(100);
      } else {
        setReadingProgress((seconds / requiredTime) * 100);
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
      if (scrollPercentage >= 90 && readingTimeSeconds >= (article?.word_count || 500) / 200 * 60 * 0.9) {
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
    if (!slug || !isReadingComplete || isRewardClaimed) return;

    try {
      setIsClaimingReward(true);
      const response = await articleService.collectReward(slug, readingTimeSeconds);
      setIsRewardClaimed(true);
      toast.success(`Reward claimed: ₹${response.reward.toFixed(2)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to claim reward');
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
            indicatorClassName="bg-amber-400"
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
                <span>{Math.ceil(readingTimeSeconds / 60)} min read</span>
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
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

          <div className="flex justify-between items-center border-t border-b py-4 border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}
              >
                <Heart className="mr-1 h-4 w-4" />
                <span>{likesCount} Likes</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}
              >
                <Bookmark className="mr-1 h-4 w-4" />
                <span>{bookmarksCount} Saves</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-gray-600 dark:text-gray-400"
              >
                <Share className="mr-1 h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
            {!isOwnArticle && (
              <Button
                variant={isReadingComplete ? 'default' : 'outline'}
                size="sm"
                onClick={handleClaimReward}
                disabled={!isReadingComplete || isRewardClaimed || isClaimingReward}
                className={
                  isReadingComplete && !isRewardClaimed
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
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
                        ? `Claim ₹${article.reward.toFixed(2)} Reward`
                        : `Read to earn ₹${article.reward.toFixed(2)}`}
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>

          <Card className="bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-2 w-full">
                  <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                    Reading Progress
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    {isReadingComplete
                      ? "You've completed this article!"
                      : `${Math.min(100, Math.round(readingProgress))}% complete`}
                  </div>
                  <Progress
                    value={readingProgress}
                    className="h-2 bg-indigo-200 dark:bg-indigo-800"
                    indicatorClassName="bg-amber-400"
                  />
                </div>
                <div className="text-center md:text-right">
                  <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                    Potential Reward
                  </div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{article.reward.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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