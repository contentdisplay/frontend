import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArticleForm from '@/components/articles/ArticleForm';
import { ArrowLeft, PenLine, AlertCircle, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import articleService, { ArticleFormData } from '@/services/articleService';
import { motion } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export default function ArticleCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [requiredBalance] = useState(150);
  const [hasInsufficientBalance, setHasInsufficientBalance] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [creationProgress, setCreationProgress] = useState(0);

  useEffect(() => {
    checkWalletBalance();
  }, []);

  const checkWalletBalance = async () => {
    try {
      setIsCheckingBalance(true);
      const result = await articleService.checkPublishBalance();
      setWalletBalance(result.current_balance);
      setHasInsufficientBalance(!result.has_sufficient_balance);
    } catch (error) {
      console.error("Failed to check wallet balance:", error);
      toast.error('Unable to check wallet balance. Default values will be used.');
      setWalletBalance(0);
      setHasInsufficientBalance(true);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handleSubmit = async (data: ArticleFormData) => {
    setError(null);
    setCreationProgress(30);
    
    try {
      setIsSubmitting(true);
      
      // Show progress indicator
      const progressInterval = setInterval(() => {
        setCreationProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      const article = await articleService.createArticle(data, true);
      
      clearInterval(progressInterval);
      setCreationProgress(100);
      
      console.log("Article created successfully:", article);
      toast.success('Article created and saved as draft');
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
          
          if (errorMessage.includes('Insufficient balance')) {
            setHasInsufficientBalance(true);
            errorDetails = `You need a minimum balance of ₹${requiredBalance} to publish articles. Your current balance is ₹${walletBalance || 0}.`;
          }
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
      setCreationProgress(0);
    }
  };

  const handleRequestPublish = async (articleId: number) => {
    try {
      // Check balance again before attempting to publish
      const balanceCheck = await articleService.checkPublishBalance();
      if (!balanceCheck.has_sufficient_balance) {
        toast.error(`Insufficient balance. You need ₹${requiredBalance} to publish.`);
        navigate('/writer/wallet');
        return;
      }
      
      await articleService.requestPublish(articleId);
      toast.success('Publication request submitted successfully');
      
      // Update wallet balance (optimistic update)
      setWalletBalance((prev) => prev !== null ? prev - requiredBalance : null);
      
      // Navigate to articles list
      navigate('/writer/articles');
    } catch (error: any) {
      console.error("Publish request error:", error);
      
      let errorMessage = 'Failed to request publication';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
        
        if (errorMessage.includes('Insufficient balance')) {
          navigate('/writer/wallet');
          return;
        }
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
        
        {creationProgress > 0 && (
          <div className="w-full bg-gray-100 dark:bg-gray-800">
            <Progress value={creationProgress} className="h-1" />
          </div>
        )}
        
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
          
          {hasInsufficientBalance && (
            <Alert variant="warning" className="mb-6 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="font-semibold text-amber-800">Insufficient Wallet Balance</AlertTitle>
              <AlertDescription className="mt-2 text-amber-700">
                <p>
                  Publishing an article requires a fee of ₹{requiredBalance.toFixed(2)}. Your current balance is ₹{walletBalance?.toFixed(2) || '0.00'}.
                </p>
                <p className="mt-2">
                  You can still create and save your article as a draft, but you'll need to add funds to your wallet before publishing.
                </p>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                    onClick={() => navigate('/writer/wallet')}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Add Funds to Wallet
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Create Your Article</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Fill in the details below to create your article. You can save it as a draft first or request publication later.
            </p>
            <Separator className="my-4" />
          </div>
          
          {isCheckingBalance ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Checking wallet balance...</p>
              </div>
            </div>
          ) : (
            <ArticleForm 
              mode="create" 
              onSubmit={handleSubmit} 
              isSubmitting={isSubmitting} 
              onRequestPublish={handleRequestPublish}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}