// pages/writer/ArticleCreatePage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArticleForm from '@/components/articles/ArticleForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import articleService from '@/services/articleService';
import { motion } from 'framer-motion';

export default function ArticleCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await articleService.createArticle(data);
      toast.success('Article created successfully');
      navigate('/writer/articles');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create article');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Create New Article
        </h1>
      </div>
      <ArticleForm mode="create" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </motion.div>
  );
}