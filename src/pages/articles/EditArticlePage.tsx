import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ArticleForm from '@/components/articles/ArticleForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import articleService, { Article, ArticleFormData } from '@/services/articleService';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ArticleEditPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingPublish, setIsRequestingPublish] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError('Article slug is missing');
        setIsLoading(false);
        return;
      }

      try {
        const articleData = await articleService.getArticleBySlug(slug);
        setArticle(articleData);
      } catch (err: any) {
        console.error('Failed to fetch article:', err);
        setError(err.response?.data?.detail || 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // This is the handler function that will be passed to ArticleForm
  const handleSubmit = async (data: ArticleFormData) => {
    if (!slug) return;
    
    try {
      setIsSubmitting(true);
      // Update the article as a regular article (not a draft)
      await articleService.updateArticle(slug, data, false);
      toast.success('Article updated successfully');
      navigate('/writer/articles');
    } catch (error: any) {
      console.error('Article update error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update article';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestPublish = async (slug: string) => {
    try {
      setIsRequestingPublish(true);
      const response = await articleService.requestPublish(slug);
      toast.success(response.detail || 'Article submitted for review');
      
      if (response.remaining_balance !== undefined) {
        toast.info(`Remaining wallet balance: ₹${response.remaining_balance.toFixed(2)}`);
      }
      
      navigate('/writer/articles');
    } catch (error: any) {
      console.error('Request publish error:', error);
      
      // Handle insufficient balance case
      if (error.redirect_to_deposit) {
        toast.error('Insufficient balance. Please add funds to your wallet.');
        navigate('/wallet');
      } else {
        toast.error(error.detail || 'Failed to request publication');
      }
    } finally {
      setIsRequestingPublish(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg">Loading article...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link to="/writer/articles">Go Back to Articles</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The article you're looking for does not exist.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link to="/writer/articles">Go Back to Articles</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow"
    >
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/writer/articles">
            <ArrowLeft className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Back to Articles
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Edit Article: {article.title}
        </h1>
      </div>
      
      {/* Status indicator */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
          bg-opacity-20 border
          ${article.status === 'draft' ? 'bg-gray-200 text-gray-800 border-gray-300' : 
          article.status === 'pending' ? 'bg-yellow-200 text-yellow-800 border-yellow-300' :
          article.status === 'published' ? 'bg-green-200 text-green-800 border-green-300' :
          article.status === 'rejected' ? 'bg-red-200 text-red-800 border-red-300' : ''}`}>
          {article.status === 'draft' ? 'Draft' : 
          article.status === 'pending' ? 'Pending Approval' :
          article.status === 'published' ? 'Published' :
          article.status === 'rejected' ? 'Rejected' : 'Unknown Status'}
        </div>
      </div>
      
      {/* Make sure to pass all required props to ArticleForm */}
      <ArticleForm 
        mode="edit" 
        initialData={article}
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
        onRequestPublish={handleRequestPublish}
      />
    </motion.div>
  );
}