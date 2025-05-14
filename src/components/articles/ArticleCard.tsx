import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '@/services/articleService';
import { Heart, Bookmark, Clock, User, Tag, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import articleService from '@/services/articleService';

interface ArticleCardProps {
  article: Article;
  isBookmarked?: boolean;
  isLiked?: boolean;
  setBookmarkedArticles?: React.Dispatch<React.SetStateAction<number[]>>;
  setLikedArticles?: React.Dispatch<React.SetStateAction<number[]>>;
  variant?: 'default' | 'horizontal' | 'compact';
}

export default function ArticleCard({
  article,
  isBookmarked = false,
  isLiked = false,
  setBookmarkedArticles,
  setLikedArticles,
  variant = 'default'
}: ArticleCardProps) {
  const [isBookmarkedState, setIsBookmarkedState] = useState(isBookmarked);
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getReadTime = () => {
    const wordsPerMinute = 200;
    const wordCount = (article.content?.split(/\s+/)?.length || 0) + 
                      (article.description?.split(/\s+/)?.length || 0);
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLikeLoading) return;
    
    try {
      setIsLikeLoading(true);
      await articleService.toggleLike(article.slug);
      
      const newState = !isLikedState;
      setIsLikedState(newState);
      
      if (setLikedArticles) {
        setLikedArticles(prev => 
          newState 
            ? [...prev, article.id] 
            : prev.filter(id => id !== article.id)
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
      await articleService.toggleBookmark(article.slug);
      
      const newState = !isBookmarkedState;
      setIsBookmarkedState(newState);
      
      if (setBookmarkedArticles) {
        setBookmarkedArticles(prev => 
          newState 
            ? [...prev, article.id] 
            : prev.filter(id => id !== article.id)
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

  if (variant === 'horizontal') {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow border-transparent hover:border-purple-100 dark:hover:border-purple-900/30">
        <div className="flex flex-col md:flex-row">
          {article.thumbnail && (
            <div className="md:w-1/3 aspect-video">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={cn("flex flex-col flex-grow p-4", !article.thumbnail && "md:w-full")}>
            <div className="flex flex-wrap gap-2 mb-2">
              {article.tags && article.tags.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                  {tag}
                </Badge>
              ))}
              {article.reward > 0 && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  <Award className="mr-1 h-3 w-3" /> ₹{article.reward}
                </Badge>
              )}
            </div>
            
            <h3 className="text-xl font-semibold line-clamp-2 mb-2 text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-400">
              {article.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
              {article.description}
            </p>
            
            <div className="mt-auto flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="h-3.5 w-3.5 mr-1" />
                <span className="mr-3">{article.author}</span>
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{getReadTime()} min read</span>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 rounded-full", isLikedState && "text-rose-500")}
                  onClick={handleLike}
                  disabled={isLikeLoading}
                >
                  <Heart className={cn("h-4 w-4", isLikedState && "fill-current")} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 rounded-full", isBookmarkedState && "text-purple-600")}
                  onClick={handleBookmark}
                  disabled={isBookmarkLoading}
                >
                  <Bookmark className={cn("h-4 w-4", isBookmarkedState && "fill-current")} />
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
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full border-transparent hover:border-purple-100 dark:hover:border-purple-900/30 group">
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
              <h3 className="font-medium line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-400">
                {article.title}
              </h3>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{getReadTime()} min read</span>
                {article.reward > 0 && (
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
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-6 w-6 rounded-full", isLikedState && "text-rose-500")}
                  onClick={handleLike}
                  disabled={isLikeLoading}
                >
                  <Heart className={cn("h-3 w-3", isLikedState && "fill-current")} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-6 w-6 rounded-full", isBookmarkedState && "text-purple-600")}
                  onClick={handleBookmark}
                  disabled={isBookmarkLoading}
                >
                  <Bookmark className={cn("h-3 w-3", isBookmarkedState && "fill-current")} />
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full border-transparent hover:border-purple-100 dark:hover:border-purple-900/30 group">
      {article.thumbnail ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
          <Tag className="h-12 w-12 text-purple-400 dark:text-purple-600 opacity-50" />
        </div>
      )}
      
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {article.tags && article.tags.slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50">
              {tag}
            </Badge>
          ))}
          {article.reward > 0 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
              <Award className="mr-1 h-3 w-3" /> ₹{article.reward}
            </Badge>
          )}
        </div>
        
        <h3 className="font-semibold text-lg line-clamp-2 mb-2 text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-400">
          {article.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
          {article.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <User className="h-3.5 w-3.5 mr-1" />
          <span className="mr-3">{article.author}</span>
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{getReadTime()} min read</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(article.published_at || article.created_at)}
        </span>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 rounded-full", isLikedState && "text-rose-500")}
            onClick={handleLike}
            disabled={isLikeLoading}
          >
            <Heart className={cn("h-4 w-4", isLikedState && "fill-current")} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 rounded-full", isBookmarkedState && "text-purple-600")}
            onClick={handleBookmark}
            disabled={isBookmarkLoading}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarkedState && "fill-current")} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}