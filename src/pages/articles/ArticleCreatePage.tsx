import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArticleForm from '@/components/articles/ArticleForm';
import { ArrowLeft, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import articleService, { ArticleFormData } from '@/services/articleService';
import { motion } from 'framer-motion';

export default function ArticleCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ArticleFormData) => {
    setError(null);
    try {
      setIsSubmitting(true);
      console.log("Creating article with data:", data);
      
      // Create the article as a regular article (not a draft)
      const createdArticle = await articleService.createArticle(data, false);
      
      console.log("Article created successfully:", createdArticle);
      toast.success('Article created successfully');
      navigate('/writer/articles');
    } catch (error: any) {
      console.error("Article creation error:", error);
      
      // More detailed error handling
      let errorMessage = 'Failed to create article';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        
        if (error.response.status === 405) {
          errorMessage = 'API endpoint method not allowed. Please check the server configuration.';
        } else if (error.response.status === 404) {
          errorMessage = 'API endpoint not found. Please check the server URL.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from server. Please check your connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10">
              <Link to="/writer/articles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Articles
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <PenLine className="mr-2 h-5 w-5" />
              Create New Article
            </h1>
          </div>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-medium">Error</h3>
              <p>{error}</p>
              <p className="mt-2 text-sm">
                Please check your backend API configuration or contact an administrator.
              </p>
            </div>
          )}
          
          <ArticleForm 
            mode="create" 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </motion.div>
  );
}