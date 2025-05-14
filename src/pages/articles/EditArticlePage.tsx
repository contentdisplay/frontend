// pages/writer/ArticleEditPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ArticleForm from '@/components/articles/ArticleForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import articleService from '@/services/articleService';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

export default function ArticleEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => articleService.getArticleBySlug(slug!),
    enabled: !!slug,
  });

  const handleSubmit = async (data: FormData) => {
    if (!slug) return;
    try {
      setIsSubmitting(true);
      await articleService.updateArticle(slug, data);
      toast.success('Article updated successfully');
      navigate('/writer/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestPublish = async (slug: string) => {
    try {
      await articleService.requestPublish(slug);
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/writer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <ArticleForm
        mode="edit"
        article={article}
        initialData={article}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onRequestPublish={handleRequestPublish}
      />
    </motion.div>
  );
}