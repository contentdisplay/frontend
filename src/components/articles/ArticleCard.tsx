// components/articles/ArticleCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '@/services/articleService';
import { Heart, Bookmark, Clock, User, Tag, Award, Edit, Send, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import articleService from '@/services/articleService';
import { useAuth } from '@/context/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DOMPurify from 'dompurify';


interface ArticleCardProps {
  article: Article;
  isBookmarked?: boolean;
  isLiked?: boolean;
  setBookmarkedArticles?: React.Dispatch<React.SetStateAction<number[]>>;
  setLikedArticles?: React.Dispatch<React.SetStateAction<number[]>>;
  variant?: 'default' | 'horizontal' | 'compact';
  onRequestPublish?: (articleId: number) => Promise<void>;
  onClick?: () => void;
}

export default function ArticleCard({
  article,
  isBookmarked = false,
  isLiked = false,
  setBookmarkedArticles,
  setLikedArticles,
  variant = 'default',
  onRequestPublish,
  onClick,
}: ArticleCardProps) {
  const { user } = useAuth();
  const [isBookmarkedState, setIsBookmarkedState] = useState(isBookmarked || article.is_bookmarked);
  const [isLikedState, setIsLikedState] = useState(isLiked || article.is_liked);
  const [likesCount, setLikesCount] = useState(article.likes_count || article.total_likes || 0);
  const [bookmarksCount, setBookmarksCount] = useState(article.bookmarks_count || article.total_bookmarks || 0);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isRequestingPublish, setIsRequestingPublish] = useState(false);
  const isOwnArticle = user?.id === article.author || user?.username === article.author_name;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  const createContentPreview = (content: string) => {
    // Remove HTML tags for preview
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(content);
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };
  
  const getReadTime = () => {
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil((article.word_count || 0) / wordsPerMinute));
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLikeLoading) return;

    try {
      setIsLikeLoading(true);
      await articleService.toggleLike(article.id);

      const newState = !isLikedState;
      setIsLikedState(newState);
      setLikesCount(prevCount => newState ? prevCount + 1 : Math.max(0, prevCount - 1));

      if (setLikedArticles) {
        setLikedArticles((prev) =>
          newState ? [...prev, article.id] : prev.filter((id) => id !== article.id)
        );
      }

      toast.success(newState ? 'Article liked' : 'Article unliked');
    } catch (error) {
      toast.error('Failed to update like status');
      console.error('Like error:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isBookmarkLoading) return;

    try {
      setIsBookmarkLoading(true);
      await articleService.toggleBookmark(article.id);

      const newState = !isBookmarkedState;
      setIsBookmarkedState(newState);
      setBookmarksCount(prevCount => newState ? prevCount + 1 : Math.max(0, prevCount - 1));

      if (setBookmarkedArticles) {
        setBookmarkedArticles((prev) =>
          newState ? [...prev, article.id] : prev.filter((id) => id !== article.id)
        );
      }

      toast.success(newState ? 'Article bookmarked' : 'Bookmark removed');
    } catch (error) {
      toast.error('Failed to update bookmark status');
      console.error('Bookmark error:', error);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleRequestPublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRequestingPublish) return;

    try {
      setIsRequestingPublish(true);
      await articleService.requestPublish(article.id);
      
      if (onRequestPublish) {
        await onRequestPublish(article.id);
      }
      
      toast.success('Publish request sent');
    } catch (error: any) {
      if (error.redirect_to_deposit || error.response?.data?.detail?.includes("Insufficient balance")) {
        toast.error('Insufficient balance. Please add funds to your wallet.');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to request publish');
      }
    } finally {
      setIsRequestingPublish(false);
    }
  };

  const getStatusBadge = () => {
    if (!isOwnArticle) return null;
    
    let variant: 'default' | 'secondary' | 'outline' | 'destructive';
    let text: string;
    let icon = null;

    if (article.is_published) {
      variant = 'default';
      text = 'Published';
    } else if (article.is_pending_publish) {
      variant = 'secondary';
      text = 'Pending';
    } else if (article.status === 'rejected') {
      variant = 'destructive';
      text = 'Rejected';
      icon = <AlertTriangle className="h-3 w-3 mr-1" />;
    } else {
      variant = 'outline';
      text = 'Draft';
    }

    return (
      <Badge variant={variant} className="ml-2">
        {icon}{text}
      </Badge>
    );
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const cardContent = (
    <>
      {article.thumbnail ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center">
          <Tag className="h-12 w-12 text-indigo-400 dark:text-indigo-600 opacity-50" />
        </div>
      )}

      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {article.tags && article.tags.slice(0, 2).map((tag, i) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            >
              {tag}
            </Badge>
          ))}
          {article.reward && article.reward > 0 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
              <Award className="mr-1 h-3 w-3" /> ₹{article.reward}
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-lg line-clamp-2 mb-2 text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 flex items-center">
          {article.title}
          {getStatusBadge()}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
          {article.content ? createContentPreview(article.content) : ''}
        </p>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <User className="h-3.5 w-3.5 mr-1" />
          <span className="mr-3">{article.author_name}</span>
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{getReadTime()} min read</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(article.published_at || article.created_at)}
        </span>

        <div className="flex gap-1">
          {isOwnArticle && !article.is_published && !article.is_pending_publish && article.status !== 'rejected' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleRequestPublish}
                    disabled={isRequestingPublish}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Request Publish (₹150)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isOwnArticle && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    asChild
                  >
                    <Link to={`/writer/articles/edit/${article.slug}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Article</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8 rounded-full', isLikedState && 'text-rose-500')}
                  onClick={handleLike}
                  disabled={isLikeLoading}
                >
                  <Heart className={cn('h-4 w-4', isLikedState && 'fill-current')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLikedState ? 'Unlike' : 'Like'} ({likesCount})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8 rounded-full', isBookmarkedState && 'text-indigo-600')}
                  onClick={handleBookmark}
                  disabled={isBookmarkLoading}
                >
                  <Bookmark className={cn('h-4 w-4', isBookmarkedState && 'fill-current')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isBookmarkedState ? 'Remove Bookmark' : 'Bookmark'} ({bookmarksCount})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </>
  );

  if (variant === 'horizontal') {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow border-indigo-100 dark:border-indigo-900/30 group cursor-pointer" onClick={handleCardClick}>
        <div className="flex flex-col md:flex-row">
          {article.thumbnail && (
            <div className="md:w-1/3 aspect-video md:aspect-auto md:h-full">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={cn('flex flex-col flex-grow p-4', !article.thumbnail && 'md:w-full')}>
            <div className="flex flex-wrap gap-2 mb-2">
              {article.tags && article.tags.slice(0, 2).map((tag, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                >
                  {tag}
                </Badge>
              ))}
              {article.reward && article.reward > 0 && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  <Award className="mr-1 h-3 w-3" /> ₹{article.reward}
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-semibold line-clamp-2 mb-2 text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 flex items-center">
              {article.title}
              {getStatusBadge()}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
              {article.content ? article.content.substring(0, 150) : ''}
            </p>

            <div className="mt-auto flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="h-3.5 w-3.5 mr-1" />
                <span className="mr-3">{article.author_name}</span>
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{getReadTime()} min read</span>
              </div>

              <div className="flex gap-1">
                {isOwnArticle && !article.is_published && !article.is_pending_publish && article.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleRequestPublish}
                    disabled={isRequestingPublish}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
                {isOwnArticle && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    asChild
                  >
                    <Link to={`/writer/articles/edit/${article.slug}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8 rounded-full', isLikedState && 'text-rose-500')}
                  onClick={handleLike}
                  disabled={isLikeLoading}
                >
                  <Heart className={cn('h-4 w-4', isLikedState && 'fill-current')} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8 rounded-full', isBookmarkedState && 'text-indigo-600')}
                  onClick={handleBookmark}
                  disabled={isBookmarkLoading}
                >
                  <Bookmark className={cn('h-4 w-4', isBookmarkedState && 'fill-current')} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full border-indigo-100 dark:border-indigo-900/30 group cursor-pointer" onClick={handleCardClick}>
        <div className="flex h-full">
          {article.thumbnail && (
            <div className="w-24 h-24 shrink-0">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-3 flex flex-col justify-between flex-grow">
            <div>
              <h3 className="font-medium line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 flex items-center">
                {article.title}
                {getStatusBadge()}
              </h3>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{getReadTime()} min read</span>
                {article.reward && article.reward > 0 && (
                  <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs py-0 px-1.5">
                    ₹{article.reward}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(article.published_at || article.created_at)}
              </span>

              <div className="flex gap-1">
                {isOwnArticle && !article.is_published && !article.is_pending_publish && article.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={handleRequestPublish}
                    disabled={isRequestingPublish}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                )}
                {isOwnArticle && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    asChild
                  >
                    <Link to={`/writer/articles/edit/${article.slug}`}>
                      <Edit className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-6 w-6 rounded-full', isLikedState && 'text-rose-500')}
                  onClick={handleLike}
                  disabled={isLikeLoading}
                >
                  <Heart className={cn('h-3 w-3', isLikedState && 'fill-current')} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-6 w-6 rounded-full', isBookmarkedState && 'text-indigo-600')}
                  onClick={handleBookmark}
                  disabled={isBookmarkLoading}
                >
                  <Bookmark className={cn('h-3 w-3', isBookmarkedState && 'fill-current')} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default card layout
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow h-full border-indigo-100 dark:border-indigo-900/30 group cursor-pointer" 
      onClick={handleCardClick}
    >
      {cardContent}
    </Card>
  );
}