import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import articleService, { Article } from '@/services/articleService';
import { WriterRewardsSection } from '@/components/articles/WriterRewardSection';

interface ArticleEarnings {
  points_earned: number;
  uncollected_reads: number;
  total_reads: number;
}

const WriterArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [earnings, setEarnings] = useState<ArticleEarnings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setError('Invalid article URL');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const articleData = await articleService.getArticleBySlug(slug);
        setArticle(articleData);

        if (articleData.author.id !== user?.id) {
          setError('You do not have permission to view this page.');
        } else {
          const earningsData = await articleService.getArticleEarnings(articleData.id);
          setEarnings(earningsData);
        }
      } catch (err: any) {
        setError(err.response?.status === 403 ? 'You do not have permission to view this page.' : 'Failed to load article details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug, user]);

  const handleCollectReward = async () => {
    if (!article) return;
    try {
      const response = await articleService.collectArticleReward(article.id);
      if (response.success) {
        setEarnings({
          ...earnings!,
          points_earned: response.total_points_earned,
          uncollected_reads: 0,
        });
        toast.success(`Collected ${response.points_collected} points!`);
      }
    } catch (error) {
      toast.error('Failed to collect rewards');
      throw error;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>
    );
  }

  if (!article) {
    return <div className="container mx-auto px-4 py-8">Article not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{article.title}</h1>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Status: {article.status.charAt(0).toUpperCase() + article.status.slice(1)}</span>
          <span className="mx-2">•</span>
          <span>Created: {new Date(article.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div
        className="prose max-w-none text-gray-700 dark:text-gray-300"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      {earnings && (
        <WriterRewardsSection
          articleId={article.id}
          totalReads={article.total_reads || 0}
          totalLikes={article.total_likes || 0}
          totalBookmarks={article.total_bookmarks || 0}
          earnedPoints={earnings.points_earned}
          uncollectedReads={earnings.uncollected_reads}
          isOwner={true}
          onCollectReward={handleCollectReward}
        />
      )}
    </div>
  );
};

export default WriterArticleDetailPage;