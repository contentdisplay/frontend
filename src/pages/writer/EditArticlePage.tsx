// pages/writer/ArticleEditPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ArticleForm from '@/components/articles/ArticleForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import articleService, { Article } from '@/services/articleService';
import { ArticleFormData } from '@/services/contentWriterService';

export default function ArticleEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        toast.error('Article not found');
        navigate('/writer/dashboard');
        return;
      }

      try {
        setIsLoading(true);
        const data = await articleService.getArticleBySlug(slug);
        setArticle(data);
      } catch (error) {
        console.error('Failed to fetch article:', error);
        toast.error('Article not found or you do not have permission to edit it');
        navigate('/writer/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The article you are trying to edit could not be found.
        </p>
        <Button asChild>
          <Link to="/writer/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/writer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <ArticleForm mode="edit" article={article} onSubmit={function (data: ArticleFormData): Promise<void> {
        throw new Error('Function not implemented.');
      } } isSubmitting={false} />
    </div>
  );
}