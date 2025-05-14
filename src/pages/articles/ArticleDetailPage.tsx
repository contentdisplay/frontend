import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import articleService, { Article } from "@/services/articleService";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(0);
  const [isReadingStarted, setIsReadingStarted] = useState(false);
  const [isReadingComplete, setIsReadingComplete] = useState(false);
  const [isRewardClaimed, setIsRewardClaimed] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [currentReward, setCurrentReward] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        const data = await articleService.getArticleBySlug(slug);
        setArticle(data);
        setLikeCount(data.like_count || 0);
        setBookmarkCount(data.bookmark_count || 0);

        // Check bookmark status
        try {
          const bookmarkStatus = await articleService.checkBookmarkStatus(slug);
          setIsBookmarked(bookmarkStatus.is_bookmarked);
        } catch (error) {
          console.error("Failed to check bookmark status:", error);
        }

        // Check like status
        try {
          const likeStatus = await articleService.checkLikeStatus(slug);
          setIsLiked(likeStatus.is_liked);
        } catch (error) {
          console.error("Failed to check like status:", error);
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
        setError("Article not found or has been removed.");
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

  // Start reading timer when user clicks "Start Reading"
  const handleStartReading = () => {
    if (isReadingStarted) return;
    setIsReadingStarted(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsedMs = Date.now() - (startTimeRef.current || Date.now());
      const minutes = Math.floor(elapsedMs / 60000);
      setReadingTimeMinutes(minutes);

      // Calculate reward: $10 for 2 minutes, +$2 per additional minute
      if (minutes >= 2) {
        setIsReadingComplete(true);
        const baseReward = 10;
        const additionalMinutes = minutes - 2;
        const totalReward = baseReward + additionalMinutes * 2;
        setCurrentReward(totalReward);
        setReadingProgress(100);
      } else {
        setReadingProgress((minutes / 2) * 100); // Progress up to 100% at 2 minutes
      }
    }, 1000);
  };

  // Scroll-based progress as a fallback
  useEffect(() => {
    if (!article || !isReadingStarted || isReadingComplete) return;

    const handleScroll = () => {
      if (!contentRef.current) return;
      const element = contentRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      const scrollPosition = element.scrollTop;
      const scrollPercentage = Math.min(
        100,
        Math.ceil((scrollPosition / totalHeight) * 100)
      );
      if (scrollPercentage >= 90 && readingTimeMinutes >= 2) {
        setIsReadingComplete(true);
        setReadingProgress(100);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [article, isReadingStarted, isReadingComplete, readingTimeMinutes]);

  const handleLike = async () => {
    if (!slug) return;
    try {
      await articleService.toggleLike(slug);
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
      toast.success(isLiked ? "Article unliked" : "Article liked");
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast.error("Failed to update like status");
    }
  };

  const handleBookmark = async () => {
    if (!slug) return;
    try {
      await articleService.toggleBookmark(slug);
      setIsBookmarked(!isBookmarked);
      setBookmarkCount((prev) => (isBookmarked ? prev - 1 : prev + 1));
      toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      toast.error("Failed to update bookmark status");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title || "Article",
          text: article?.description || "Check out this article",
          url: window.location.href,
        })
        .then(() => toast.success("Article shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleClaimReward = async () => {
    if (!slug || !isReadingComplete || isRewardClaimed || readingTimeMinutes < 2) return;

    try {
      setIsClaimingReward(true);
      const response = await articleService.collectReward(slug, readingTimeMinutes);
      setIsRewardClaimed(true);
      toast.success(`Reward claimed: $${response.reward.toFixed(2)}`);
    } catch (error) {
      console.error("Failed to claim reward:", error);
      toast.error("Failed to claim reward. Please try again.");
    } finally {
      setIsClaimingReward(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMMM dd, yyyy");
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
          <AlertDescription>{error || "Article not found"}</AlertDescription>
        </Alert>
        <Button variant="outline" asChild className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900">
          <Link to="/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
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
        </div>

        {/* Progress Bar */}
        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-2">
          <Progress
            value={readingProgress}
            className="h-1 bg-gray-200 dark:bg-gray-700"
            indicatorClassName="bg-amber-400"
          />
        </div>

        <article className="space-y-8">
          {/* Article Header */}
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
                <span>{readingTimeMinutes} min read</span>
              </div>
              <div>
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
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

          {/* Start Reading Button */}
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

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-gray-600 dark:text-gray-300 font-medium"
          >
            {article.description}
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            ref={contentRef}
            className="prose max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-base prose-blockquote:border-l-indigo-600 prose-blockquote:text-gray-600 dark:prose-blockquote:border-l-indigo-400 dark:prose-blockquote:text-gray-400 prose-blockquote:not-italic overflow-auto max-h-[60vh] bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Actions Bar */}
          <div className="flex justify-between items-center border-t border-b py-4 border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={isLiked ? "text-red-500" : "text-gray-600 dark:text-gray-400"}
              >
                <Heart className="mr-1 h-4 w-4" />
                <span>{likeCount} Likes</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-400"}
              >
                <Bookmark className="mr-1 h-4 w-4" />
                <span>{bookmarkCount} Saves</span>
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
            <Button
              variant={isReadingComplete ? "default" : "outline"}
              size="sm"
              onClick={handleClaimReward}
              disabled={!isReadingComplete || isRewardClaimed || isClaimingReward || readingTimeMinutes < 2}
              className={
                isReadingComplete && !isRewardClaimed
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                  : "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
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
                      ? `Claim $${currentReward.toFixed(2)} Reward`
                      : `Read 2 min to earn $${currentReward.toFixed(2)}`}
                  </span>
                </>
              )}
            </Button>
          </div>

          {/* Reading Progress Card */}
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
                    Current Reward
                  </div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${currentReward.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </motion.div>
    </div>
  );
}