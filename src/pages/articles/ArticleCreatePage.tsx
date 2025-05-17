import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArticleForm from '@/components/articles/ArticleForm';
import { ArrowLeft, PenLine, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import articleService, { ArticleFormData } from '@/services/articleService';
import { motion } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function ArticleCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);

  const handleSubmit = async (data: ArticleFormData) => {
    setError(null);
    try {
      setIsSubmitting(true);
      
      const article = await articleService.createArticle(data, true);
      
      console.log("Article created successfully:", article);
      toast.success('Article created successfully');
      return article;
    } catch (error: any) {
      console.error("Article creation error:", error);
      
      let errorMessage = 'Failed to create article';
      let errorDetails = '';
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        
        if (error.response.status === 405) {
          errorMessage = 'API endpoint method not allowed';
          errorDetails = 'The server is configured incorrectly. Please contact technical support.';
        } else if (error.response.status === 404) {
          errorMessage = 'API endpoint not found';
          errorDetails = 'The article creation service is unavailable. Please contact technical support.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid article data';
          
          if (typeof error.response.data === 'object') {
            const fieldErrors = Object.entries(error.response.data)
              .map(([field, errors]: [string, any]) => {
                const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
                const errorMessages = Array.isArray(errors) ? errors.join(', ') : String(errors);
                return `${fieldName}: ${errorMessages}`;
              })
              .join('\n');
            
            if (fieldErrors) {
              errorDetails = `Please correct the following issues:\n${fieldErrors}`;
            } else {
              errorDetails = 'The server could not process your request due to validation errors.';
            }
          }
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server';
        errorDetails = 'Please check your internet connection and try again.';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
        errorDetails = 'There was a problem processing your request. Please try again later.';
      }
      
      setError({ message: errorMessage, details: errorDetails });
      toast.error(errorMessage);
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestPublish = async (articleId: number) => {
    try {
      await articleService.requestPublish(articleId);
      toast.success('Publish request submitted successfully');
    } catch (error: any) {
      console.error("Publish request error:", error);
      let errorMessage = 'Failed to request publication';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast.error(errorMessage);
      throw error;
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
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold">{error.message}</AlertTitle>
              {error.details && (
                <AlertDescription className="mt-2 whitespace-pre-line">
                  {error.details}
                </AlertDescription>
              )}
            </Alert>
          )}
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Create Your Article</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Fill in the details below to create your article. You can save it as a draft first or request publication later.
            </p>
            <Separator className="my-4" />
          </div>
          
          <ArticleForm 
            mode="create" 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            onRequestPublish={handleRequestPublish}
          />
        </div>
      </div>
    </motion.div>
  );
}