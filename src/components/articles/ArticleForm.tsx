import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Article, ArticleFormData } from '@/services/articleService';
import { X, UploadCloud, Wallet, AlertCircle, Save, Loader2, CheckCircle, ArrowRight, Clock, BookOpen, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import articleService from '@/services/articleService';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import 'react-quill/dist/quill.snow.css';
import { Card, CardContent } from '@/components/ui/card';

// Function to count words, stripping HTML tags
const countWords = (text: string): number => {
  if (!text) return 0;
  const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plainText.split(' ').filter(word => word.length > 0).length;
};

// Function to estimate reading time and rewards based on word count (matching backend logic)
const estimateReadingTimeAndReward = (wordCount: number) => {
  let readingTimeMinutes = 0;
  let collectableRewardPoints = 0;
  
  if (wordCount < 200) {
    readingTimeMinutes = 2;
    collectableRewardPoints = 10;
  } else if (wordCount >= 200 && wordCount <= 500) {
    readingTimeMinutes = 5;
    collectableRewardPoints = 20;
  } else {
    readingTimeMinutes = 15;
    collectableRewardPoints = 30;
  }
  
  return { readingTimeMinutes, collectableRewardPoints };
};

// Schema definitions
const articleDraftSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string().optional().default(''),
});

const articlePublishSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }),
  content: z.string().refine(
    (value) => countWords(value) >= 100,
    { message: 'Content must be at least 100 words' }
  ),
});

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => Promise<Article | null>;
  initialData?: Article;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  article?: Article;
  onRequestPublish?: (id: number) => Promise<void>;
}

export default function ArticleForm({
  initialData,
  isSubmitting,
  mode,
  onSubmit,
  onRequestPublish
}: ArticleFormProps) {
  const navigate = useNavigate();
  
  // Form state
  const form = useForm<z.infer<typeof articleDraftSchema>>({
    resolver: zodResolver(articleDraftSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
    },
  });

  // Component state
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnail || null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [requiredBalance] = useState<number>(150);
  const [showDepositPrompt, setShowDepositPrompt] = useState(false);
  const [isPublishable, setIsPublishable] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // Reading time and reward metrics state
  const [readingTimeMinutes, setReadingTimeMinutes] = useState<number>(0);
  const [collectableRewardPoints, setCollectableRewardPoints] = useState<number>(0);
  const [usingBackendMetrics, setUsingBackendMetrics] = useState<boolean>(false);
  
  // UI loading states
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isRequestingPublish, setIsRequestingPublish] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [ReactQuill, setReactQuill] = useState<any>(null);
  
  // Dialog states
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successAction, setSuccessAction] = useState<'created' | 'updated' | 'draft' | 'pending' | null>(null);
  const [createdArticle, setCreatedArticle] = useState<Article | null>(null);

  // Load the rich text editor
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-quill').then((mod) => {
        setReactQuill(() => mod.default);
        setEditorLoaded(true);
      }).catch(err => {
        console.error("Failed to load Rich Text Editor:", err);
        toast.error("Failed to load editor. Please refresh the page.");
      });
    }
  }, []);

  // Check wallet balance on component mount
  useEffect(() => {
    if (mode === 'create' || (mode === 'edit' && initialData && !initialData.is_published)) {
      checkWalletBalance();
    }
  }, [mode, initialData]);

  // Update metrics from backend when initialData is available
  useEffect(() => {
    if (initialData) {
      // Check if backend provides these values
      if (initialData.reading_time_minutes && initialData.collectable_reward_points) {
        setReadingTimeMinutes(initialData.reading_time_minutes);
        setCollectableRewardPoints(initialData.collectable_reward_points);
        setUsingBackendMetrics(true);
      } else {
        // Fall back to frontend calculation based on word count
        const { readingTimeMinutes, collectableRewardPoints } = estimateReadingTimeAndReward(
          initialData.word_count || countWords(initialData.content)
        );
        setReadingTimeMinutes(readingTimeMinutes);
        setCollectableRewardPoints(collectableRewardPoints);
        setUsingBackendMetrics(false);
      }
    } else {
      // Reset values for new articles
      const { readingTimeMinutes, collectableRewardPoints } = estimateReadingTimeAndReward(0);
      setReadingTimeMinutes(readingTimeMinutes);
      setCollectableRewardPoints(collectableRewardPoints);
      setUsingBackendMetrics(false);
    }
  }, [initialData]);

  // Update metrics when createdArticle is set (after creation/update)
  useEffect(() => {
    if (createdArticle) {
      if (createdArticle.reading_time_minutes && createdArticle.collectable_reward_points) {
        setReadingTimeMinutes(createdArticle.reading_time_minutes);
        setCollectableRewardPoints(createdArticle.collectable_reward_points);
        setUsingBackendMetrics(true);
      }
    }
  }, [createdArticle]);

  // Update metrics as user edits content (real-time feedback)
  useEffect(() => {
    // If actively editing, calculate metrics based on content
    const subscription = form.watch((value, { name }) => {
      if (name === 'content' || !usingBackendMetrics) {
        const content = value.content as string || '';
        const wordCount = countWords(content);
        const { readingTimeMinutes, collectableRewardPoints } = estimateReadingTimeAndReward(wordCount);
        
        setReadingTimeMinutes(readingTimeMinutes);
        setCollectableRewardPoints(collectableRewardPoints);
        // Mark as using frontend calculation while editing
        setUsingBackendMetrics(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, usingBackendMetrics]);

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      const values = form.getValues();
      if (values.title && form.formState.isDirty) {
        const now = new Date().toLocaleTimeString();
        localStorage.setItem('article_draft', JSON.stringify({
          ...values,
          timestamp: new Date().toISOString(),
        }));
        setDraftSaved(true);
        setLastSaved(now);
        toast.info('Draft auto-saved', { id: 'autosave', duration: 2000 });
      }
    }, 60000); // Auto-save every minute
    
    return () => clearInterval(interval);
  }, [form]);

  // Restore saved draft (for create mode only)
  useEffect(() => {
    if (mode === 'create') {
      const savedDraft = localStorage.getItem('article_draft');
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          const timestamp = new Date(parsedDraft.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            form.reset({
              title: parsedDraft.title || '',
              content: parsedDraft.content || '',
            });
            setDraftSaved(true);
            setLastSaved(new Date(parsedDraft.timestamp).toLocaleTimeString());
            toast.info('Draft restored from your last session');
            
            // Calculate metrics for restored draft
            const wordCount = countWords(parsedDraft.content || '');
            const { readingTimeMinutes, collectableRewardPoints } = estimateReadingTimeAndReward(wordCount);
            setReadingTimeMinutes(readingTimeMinutes);
            setCollectableRewardPoints(collectableRewardPoints);
          }
        } catch (e) {
          console.error('Failed to restore draft:', e);
        }
      }
    }
  }, [mode, form]);

  // Check wallet balance
  const checkWalletBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const result = await articleService.checkPublishBalance();
      setWalletBalance(result.current_balance);
      setIsPublishable(result.has_sufficient_balance);
      setShowDepositPrompt(!result.has_sufficient_balance);
    } catch (error) {
      console.error("Failed to check wallet balance:", error);
      setWalletBalance(0);
      setShowDepositPrompt(true);
      setIsPublishable(false);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Handle thumbnail uploads
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size exceeds 5MB limit');
        return;
      }
      
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle redirection to wallet page
  const handleDepositRedirect = () => {
    const values = form.getValues();
    localStorage.setItem('article_draft', JSON.stringify({
      ...values,
      timestamp: new Date().toISOString(),
    }));
    setDraftSaved(true);
    setLastSaved(new Date().toLocaleTimeString());
    toast.info('Your draft has been saved. You will be redirected to add funds to your wallet.');
    navigate('/writer/wallet');
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    try {
      const values = form.getValues();
      if (!values.title.trim()) {
        toast.error('Please provide at least a title for your draft');
        return;
      }
      
      setIsSavingDraft(true);
      
      const formData: ArticleFormData = {
        title: values.title,
        content: values.content || '',
        tags: [],
        thumbnail: thumbnail || undefined,
        status: 'draft'
      };

      if (mode === 'create') {
        const article = await articleService.createArticle(formData, true);
        localStorage.removeItem('article_draft');
        setCreatedArticle(article);
        
        // Update metrics with backend values if available
        if (article.reading_time_minutes && article.collectable_reward_points) {
          setReadingTimeMinutes(article.reading_time_minutes);
          setCollectableRewardPoints(article.collectable_reward_points);
          setUsingBackendMetrics(true);
        }
        
        setSuccessAction('draft');
        setShowSuccessDialog(true);
      } else {
        if (!initialData?.slug) throw new Error('Article slug not provided');
        const updatedArticle = await articleService.updateArticle(initialData.slug, formData, true);
        
        // Update metrics with backend values if available
        if (updatedArticle.reading_time_minutes && updatedArticle.collectable_reward_points) {
          setReadingTimeMinutes(updatedArticle.reading_time_minutes);
          setCollectableRewardPoints(updatedArticle.collectable_reward_points);
          setUsingBackendMetrics(true);
        }
        
        setSuccessAction('draft');
        setShowSuccessDialog(true);
      }
      
      setDraftSaved(true);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error: any) {
      handleApiError(error, 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Submit form (create/update article)
  const handleFormSubmit = async (values: z.infer<typeof articleDraftSchema>) => {
    try {
      const result = articleDraftSchema.safeParse(values);
      if (!result.success) {
        result.error.errors.forEach(err => {
          form.setError(err.path[0] as keyof z.infer<typeof articleDraftSchema>, {
            type: 'manual',
            message: err.message,
          });
        });
        return;
      }
      
      const formData: ArticleFormData = {
        title: values.title,
        content: values.content || '',
        tags: [],
        thumbnail: thumbnail || undefined,
        status: 'draft'
      };

      const article = await onSubmit(formData);
      if (!article) return;
      
      setCreatedArticle(article);
      
      // Update metrics with backend values if available
      if (article.reading_time_minutes && article.collectable_reward_points) {
        setReadingTimeMinutes(article.reading_time_minutes);
        setCollectableRewardPoints(article.collectable_reward_points);
        setUsingBackendMetrics(true);
      }
      
      if (mode === 'create') {
        localStorage.removeItem('article_draft');
        setSuccessAction('created');
      } else {
        setSuccessAction('updated');
      }
      
      setShowSuccessDialog(true);
    } catch (error: any) {
      handleApiError(error, `Failed to ${mode === 'create' ? 'create' : 'update'} article`);
    }
  };

  // Handle request to publish
  const handleRequestPublish = async () => {
    if (!initialData?.id && !createdArticle?.id) return;
    
    try {
      const values = form.getValues();
      const result = articlePublishSchema.safeParse(values);
      
      if (!result.success) {
        const errorMessages = result.error.errors.map(err => err.message);
        toast.error(errorMessages.join('. '));
        
        result.error.errors.forEach(err => {
          form.setError(err.path[0] as keyof z.infer<typeof articleDraftSchema>, {
            type: 'manual',
            message: err.message,
          });
        });
        return;
      }
      
      setIsRequestingPublish(true);
      
      // Check balance again to ensure it's sufficient
      const balanceCheck = await articleService.checkPublishBalance();
      if (!balanceCheck.has_sufficient_balance) {
        toast.error(`Insufficient balance. You need ₹${balanceCheck.required_balance} to publish.`);
        setShowDepositPrompt(true);
        setIsRequestingPublish(false);
        return;
      }
      
      const formData: ArticleFormData = {
        title: values.title,
        content: values.content || '',
        tags: [],
        thumbnail: thumbnail || undefined,
        status: 'pending'
      };
      
      let articleId = initialData?.id || createdArticle?.id;
      let updatedArticle;
      
      // Update the article first if needed
      if (mode === 'edit' && initialData?.slug) {
        updatedArticle = await articleService.updateArticle(initialData.slug, formData);
        
        // Update metrics with backend values if available
        if (updatedArticle.reading_time_minutes && updatedArticle.collectable_reward_points) {
          setReadingTimeMinutes(updatedArticle.reading_time_minutes);
          setCollectableRewardPoints(updatedArticle.collectable_reward_points);
          setUsingBackendMetrics(true);
        }
      } else if (mode === 'create' && createdArticle?.slug) {
        updatedArticle = await articleService.updateArticle(createdArticle.slug, formData);
        
        // Update metrics with backend values if available
        if (updatedArticle.reading_time_minutes && updatedArticle.collectable_reward_points) {
          setReadingTimeMinutes(updatedArticle.reading_time_minutes);
          setCollectableRewardPoints(updatedArticle.collectable_reward_points);
          setUsingBackendMetrics(true);
        }
      }
      
      // Then request publishing
      await onRequestPublish?.(articleId!);
      
      // Update the wallet balance (optimistic update)
      setWalletBalance(prev => Math.max(0, prev - requiredBalance));
      
      // Show success dialog with pending status
      setSuccessAction('pending');
      setShowSuccessDialog(true);
    } catch (error: any) {
      if (error.response?.data?.detail?.includes("Insufficient balance")) {
        toast.error('Insufficient balance. Please add funds to your wallet.');
        handleDepositRedirect();
      } else {
        handleApiError(error, 'Failed to request article publication');
      }
    } finally {
      setIsRequestingPublish(false);
      setShowPublishConfirm(false);
    }
  };

  // Common error handling function
  const handleApiError = (error: any, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    
    if (error.response) {
      if (error.response.status === 405) {
        errorMessage = 'API endpoint not configured correctly. Please contact an administrator.';
      } else if (error.response.status === 400 && typeof error.response.data === 'object') {
        const fieldErrors = Object.entries(error.response.data)
          .map(([field, errs]: [string, any]) => {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
            const errString = Array.isArray(errs) ? errs.join(', ') : String(errs);
            
            if (['title', 'content'].includes(field)) {
              form.setError(field as keyof z.infer<typeof articleDraftSchema>, {
                type: 'manual',
                message: errString,
              });
            }
            
            return `${fieldName}: ${errString}`;
          })
          .join('. ');
        
        if (fieldErrors) errorMessage = fieldErrors;
      } else if (error.response.data?.detail) {
        errorMessage = error.response.data.detail;
      }
    }
    
    toast.error(errorMessage);
  };

  // Show publish confirmation dialog
  const initiatePublishRequest = () => {
    const values = form.getValues();
    const result = articlePublishSchema.safeParse(values);
    
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => err.message);
      toast.error(errorMessages.join('. '));
      
      result.error.errors.forEach(err => {
        form.setError(err.path[0] as keyof z.infer<typeof articleDraftSchema>, {
          type: 'manual',
          message: err.message,
        });
      });
      return;
    }
    
    setShowPublishConfirm(true);
  };

  // Get word count for validation and UI display
  const wordCount = countWords(form.watch('content'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 max-w-4xl mx-auto">
        {/* Auto-save feature info */}
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800 shadow-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-400 font-semibold">Writer Features</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            <p>You can save this article as a draft and return to edit it later. Your work is auto-saved every minute.</p>
            {draftSaved && lastSaved && (
              <p className="mt-1 text-sm font-medium">Last auto-saved: {lastSaved}</p>
            )}
            <p className="mt-1">When you're ready to publish, you can request admin review (₹{requiredBalance} fee) which typically takes 15 minutes.</p>
          </AlertDescription>
        </Alert>

        {showDepositPrompt && (
          <Alert variant="warning" className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-200 dark:border-yellow-800 shadow-sm">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-400 font-semibold">Publishing Fee Required</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              <p>
                Publishing an article requires a fee of ₹{requiredBalance.toFixed(2)}. Your current wallet balance 
                is ₹{walletBalance.toFixed(2)}, which is 
                {walletBalance < requiredBalance 
                  ? ` not sufficient. You need ₹${(requiredBalance - walletBalance).toFixed(2)} more.`
                  : ' sufficient for publishing.'
                }
              </p>
              {walletBalance < requiredBalance && (
                <div className="mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleDepositRedirect}
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Add Funds to Wallet
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Writing requirements info */}
        <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800 shadow-sm">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-400 font-semibold">Article Requirements</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Title: At least 5 characters</li>
              <li>Content: Minimum 100 words</li>
              <li>Recommended: 500+ words for better engagement</li>
              <li>Publishing fee: ₹150 (deducted once approved)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Word count, reading time, and reward metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={cn(
            "border rounded-lg shadow-sm transition-colors",
            wordCount < 100 ? "bg-red-50 border-red-200" : 
            wordCount < 500 ? "bg-yellow-50 border-yellow-200" : 
            "bg-green-50 border-green-200"
          )}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                wordCount < 100 ? "bg-red-100" : 
                wordCount < 500 ? "bg-yellow-100" : 
                "bg-green-100"
              )}>
                <AlertCircle className={cn(
                  "h-6 w-6",
                  wordCount < 100 ? "text-red-600" : 
                  wordCount < 500 ? "text-yellow-600" : 
                  "text-green-600"
                )} />
              </div>
              <h3 className="font-semibold text-gray-800">Word Count</h3>
              <p className={cn(
                "text-2xl font-bold",
                wordCount < 100 ? "text-red-700" : 
                wordCount < 500 ? "text-yellow-700" : 
                "text-green-700"
              )}>
                {wordCount}
              </p>
              <p className="text-sm mt-1">
                {wordCount < 100 && "Minimum 100 required"}
                {wordCount >= 100 && wordCount < 500 && "Good! Aim for 500+"}
                {wordCount >= 500 && "Excellent length!"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200 border rounded-lg shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Reading Time</h3>
              <p className="text-2xl font-bold text-blue-700">
                {readingTimeMinutes} min
              </p>
              <p className="text-sm mt-1 text-blue-600">
                Estimated time to read
                {usingBackendMetrics && " (calculated by server)"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200 border rounded-lg shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Reader Reward</h3>
              <p className="text-2xl font-bold text-purple-700">
                {collectableRewardPoints} points
              </p>
              <p className="text-sm mt-1 text-purple-600">
                Points readers can earn
                {usingBackendMetrics && " (calculated by server)"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Thumbnail upload */}
        <div className="space-y-2">
          <FormLabel className="text-base font-medium">Thumbnail Image</FormLabel>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg p-6 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors bg-white dark:bg-gray-800">
            {thumbnailPreview ? (
              <div className="relative w-full max-w-md">
                <img
                  src={thumbnailPreview}
                  alt="Article thumbnail"
                  className="rounded-md w-full h-auto max-h-48 object-cover shadow-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-sm"
                  onClick={() => {
                    setThumbnail(null);
                    setThumbnailPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center space-y-2 cursor-pointer w-full">
                <UploadCloud className="h-12 w-12 text-indigo-400 dark:text-indigo-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click to upload thumbnail
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 5MB
                </span>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Title <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter article title" 
                  {...field} 
                  className="border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </FormControl>
              <FormDescription>A catchy title that describes your article (required)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Content</FormLabel>
              <FormControl>
                {editorLoaded && ReactQuill ? (
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    className="min-h-[300px] rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  </div>
                )}
              </FormControl>
              <FormDescription>
                Write your article content with rich formatting 
                {mode === 'create' && <span> (required for publishing, optional for drafts)</span>}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action buttons */}
        <div className="flex flex-wrap md:flex-nowrap justify-between pt-6 gap-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (form.formState.isDirty) {
                if (window.confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
                  navigate('/writer/articles');
                }
              } else {
                navigate('/writer/articles');
              }
            }}
            className="w-full md:w-auto border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          
          <div className="flex flex-wrap gap-3 justify-end w-full md:w-auto">
            {/* Save as Draft Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full md:w-auto text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20",
                      draftSaved && !form.formState.isDirty && "bg-blue-50 border-blue-400 dark:bg-blue-900/30"
                    )}
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft}
                  >
                    {isSavingDraft ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : draftSaved && !form.formState.isDirty ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Draft Saved
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save as Draft
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save your article as a draft to edit later</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Create/Update Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </>
              ) : mode === 'edit' ? (
                'Update Article'
              ) : (
                'Create Article'
              )}
            </Button>
            
            {/* Request Publish Button */}
            {((mode === 'edit' && initialData && !initialData.is_published && !initialData.is_pending_publish && initialData.status !== 'rejected') || (mode === 'create' && createdArticle && createdArticle.status === 'draft')) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full md:w-auto text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/20"
                      onClick={initiatePublishRequest}
                      disabled={!isPublishable || isRequestingPublish}
                    >
                      {isRequestingPublish ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          Request Publish (₹{requiredBalance})
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Submit article for admin review and publishing (₹{requiredBalance} fee)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              {successAction === 'created' && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Article Created Successfully!
                </>
              )}
              {successAction === 'updated' && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Article Updated Successfully!
                </>
              )}
              {successAction === 'draft' && (
                <>
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  Draft Saved Successfully!
                </>
              )}
              {successAction === 'pending' && (
                <>
                  <Clock className="h-6 w-6 text-amber-500" />
                  Article Submitted for Review
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {successAction === 'created' && 'Your article has been created and pending wait for admin approval.'}
              {successAction === 'updated' && 'Your changes have been saved.'}
              {successAction === 'draft' && 'Your draft has been saved. You can come back and continue editing later.'}
              {successAction === 'pending' && (
                <>
                  Your article has been submitted for review. ₹{requiredBalance} has been deducted from your wallet.
                  An administrator will review your article within 15 minutes.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            {successAction === 'created' && (
              <div className="space-y-4">
                <p className="text-center font-medium">What would you like to do next?</p>
                <div className="grid gap-3">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setShowSuccessDialog(false);
                      navigate('/writer/articles');
                    }}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    View My Articles
                  </Button>
                  
                  {!isPublishable && (
                    <Button
                      variant="outline"
                      className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                      onClick={() => {
                        setShowSuccessDialog(false);
                        handleDepositRedirect();
                      }}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Add Funds to Wallet
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {successAction === 'pending' && (
              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-800 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Review Process
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm text-amber-700">
                    <li className="flex items-start">
                      <span className="inline-block w-4 h-4 bg-amber-200 rounded-full text-amber-800 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                      Your article is now in the admin review queue
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-4 h-4 bg-amber-200 rounded-full text-amber-800 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                      Reviews typically take less than 15 minutes
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-4 h-4 bg-amber-200 rounded-full text-amber-800 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                      You'll receive a notification when approved
                    </li>
                  </ul>
                </div>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    navigate('/writer/articles');
                  }}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  View My Articles
                </Button>
              </div>
            )}
            
            {(successAction === 'updated' || successAction === 'draft') && (
              <div className="flex justify-center">
                <Button
                  variant="default"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    navigate('/writer/articles');
                  }}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  View My Articles
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <Dialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-700 dark:text-amber-400">
              Confirm Publication Request
            </DialogTitle>
            <DialogDescription>
              You're about to request publication of your article. This will deduct ₹{requiredBalance} from your wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800 mb-4">
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">What happens next?</h4>
            <ol className="list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-300 text-sm">
              <li>₹{requiredBalance} will be deducted from your wallet</li>
              <li>Your article will be placed in a review queue</li>
              <li>An administrator will review it within 15 minutes</li>
              <li>You'll receive a notification once approved</li>
              <li>After approval, your article will be published publicly</li>
            </ol>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current wallet balance:</span>
            <span className="font-semibold">₹{walletBalance.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Publication fee:</span>
            <span className="font-semibold text-red-600">- ₹{requiredBalance.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2 border-gray-200 dark:border-gray-700">
            <span className="font-medium">Remaining balance after payment:</span>
            <span className="font-semibold">
              ₹{Math.max(0, walletBalance - requiredBalance).toFixed(2)}
            </span>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPublishConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleRequestPublish}
              disabled={isRequestingPublish}
            >
              {isRequestingPublish ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Confirm & Pay ₹{requiredBalance}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}