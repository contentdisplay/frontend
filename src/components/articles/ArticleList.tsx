// components/articles/ArticleList.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Article } from '@/services/articleService';
import ArticleCard from './ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ArticleListProps {
  articles: Article[];
  isLoading: boolean;
  emptyMessage?: string;
  onRequestPublish?: (slug: string) => Promise<void>;
  bookmarkedArticles?: number[];
  likedArticles?: number[];
  setBookmarkedArticles?: React.Dispatch<React.SetStateAction<number[]>>;
  setLikedArticles?: React.Dispatch<React.SetStateAction<number[]>>;
  variant?: 'default' | 'horizontal' | 'compact';
}

export function ArticleList({
  articles,
  isLoading,
  emptyMessage = "No articles found",
  onRequestPublish,
  bookmarkedArticles = [],
  likedArticles = [],
  setBookmarkedArticles,
  setLikedArticles,
  variant = 'default'
}: ArticleListProps) {
  const navigate = useNavigate();

  const handleArticleClick = (slug: string) => {
    navigate(`/articles/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map(article => (
        <ArticleCard
          key={article.id}
          article={article}
          variant={variant}
          isBookmarked={bookmarkedArticles.includes(article.id)}
          isLiked={likedArticles.includes(article.id)}
          setBookmarkedArticles={setBookmarkedArticles}
          setLikedArticles={setLikedArticles}
          onRequestPublish={onRequestPublish}
          onClick={() => handleArticleClick(article.slug)}
        />
      ))}
    </div>
  );
}