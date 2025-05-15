// components/articles/ArticleForm.tsx - Modified version to emphasize draft functionality

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
import { Textarea } from '@/components/ui/textarea';
import { Article, ArticleFormData } from '@/services/articleService';
import { X, UploadCloud, Wallet, AlertCircle, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';
import articleService from '@/services/articleService';
import walletService from '@/services/walletService';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const articleFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' }),
  content: z.string().min(100, { message: 'Content must be at least 100 characters long' }),
  tags: z.array(z.string()).min(1, { message: 'At least one tag is required' }),
});

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => Promise<void>;
  initialData?: Article;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  article?: Article;
  onRequestPublish?: (slug: string) => Promise<void>;
}

export default function ArticleForm({ initialData, isSubmitting, mode, onRequestPublish }: ArticleFormProps) {
  const navigate = useNavigate();
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnail || null
  );
  const [tagInput, setTagInput] = useState('');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [requiredBalance, setRequiredBalance] = useState<number>(150);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showDepositPrompt, setShowDepositPrompt] = useState(false);
  const [isPublishable, setIsPublishable] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  const form = useForm<z.infer<typeof articleFormSchema>>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      tags: initialData?.tags || [],
    },
  });

  useEffect(() => {
    if (mode === 'create' || (mode === 'edit' && initialData && !initialData.is_published)) {
      checkWalletBalance();
    }
  }, [mode, initialData]);

  const checkWalletBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const result = await walletService.checkPublishBalance();
      setWalletBalance(result.current_balance);
      setRequiredBalance(result.required_balance);
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

  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const currentTags = form.getValues('tags');
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue('tags', [...currentTags, tagInput.trim()]);
      form.trigger('tags');
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter((t) => t !== tag));
    form.trigger('tags');
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);

      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositRedirect = () => {
    navigate('/wallet');
  };

  const handleSaveDraft = async (values: z.infer<typeof articleFormSchema>) => {
    try {
      setIsSavingDraft(true);
      const formData: ArticleFormData = {
        title: values.title,
        description: values.description,
        content: values.content,
        tags: values.tags,
        thumbnail: thumbnail || undefined,
      };

      if (mode === 'create') {
        await articleService.createArticle(formData);
        toast.success('Draft saved successfully');
      } else {
        if (!initialData?.slug) throw new Error('Article slug not provided');
        await articleService.updateArticle(initialData.slug, formData);
        toast.success('Draft updated successfully');
      }
      navigate('/writer/articles');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to save draft`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof articleFormSchema>) => {
    try {
      const formData: ArticleFormData = {
        title: values.title,
        description: values.description,
        content: values.content,
        tags: values.tags,
        thumbnail: thumbnail || undefined,
      };

      if (mode === 'create') {
        await articleService.createArticle(formData);
        toast.success('Article created successfully');
      } else {
        if (!initialData?.slug) throw new Error('Article slug not provided');
        await articleService.updateArticle(initialData.slug, formData);
        toast.success('Article updated successfully');
      }
      navigate('/writer/articles');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${mode === 'create' ? 'create' : 'update'} article`);
    }
  };

  const handleRequestPublish = async () => {
    if (!initialData?.slug || !onRequestPublish) return;
    
    try {
      // First check if wallet has sufficient balance
      const balanceCheck = await walletService.checkPublishBalance();
      if (!balanceCheck.has_sufficient_balance) {
        toast.error(`Insufficient balance. You need ₹${balanceCheck.required_balance} to publish.`);
        setShowDepositPrompt(true);
        return;
      }
      
      // Request publication
      await onRequestPublish(initialData.slug);
      
      toast.success('Publish request sent successfully. Article is now pending approval and will be reviewed within 15 minutes.');
      navigate('/writer/articles');
    } catch (error: any) {
      if (error.redirect_to_deposit) {
        toast.error('Insufficient balance. Please add funds to your wallet.');
        handleDepositRedirect();
      } else {
        toast.error(error.response?.data?.detail || 'Failed to request article publication');
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-4xl mx-auto">
        {/* Auto-save feature info */}
        <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-400">Writer Features</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            <p>You can save this article as a draft and return to edit it later.</p>
            <p className="mt-1">When you're ready to publish, you can request admin review (₹150 fee) which typically takes 15 minutes.</p>
          </AlertDescription>
        </Alert>

        {showDepositPrompt && (
          <Alert variant="warning" className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-400">Publishing Fee Required</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              <p>
                Publishing an article requires a fee of ₹{requiredBalance.toFixed(2)}. Your current wallet balance 
                is ₹{walletBalance?.toFixed(2) || '0.00'}, which is 
                {walletBalance !== null && walletBalance < requiredBalance 
                  ? ` not sufficient. You need ₹${(requiredBalance - walletBalance).toFixed(2)} more.`
                  : ' sufficient for publishing.'
                }
              </p>
              {walletBalance !== null && walletBalance < requiredBalance && (
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

        {/* Thumbnail upload */}
        <div className="space-y-2">
          <FormLabel>Thumbnail Image</FormLabel>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg p-6 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
            {thumbnailPreview ? (
              <div className="relative w-full max-w-md">
                <img
                  src={thumbnailPreview}
                  alt="Article thumbnail"
                  className="rounded-md w-full h-auto max-h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter article title" {...field} />
              </FormControl>
              <FormDescription>A catchy title that describes your article</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief summary of your article"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>A short introduction that will appear in previews</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 my-2">
                {field.value.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 rounded-full"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <FormDescription>Add relevant tags to help readers find your article</FormDescription>
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
              <FormLabel>Content</FormLabel>
              <FormControl>
                <ReactQuill
                  theme="snow"
                  value={field.value}
                  onChange={field.onChange}
                  className="min-h-[200px] rounded-md bg-white dark:bg-gray-800"
                />
              </FormControl>
              <FormDescription>Write your article content with rich formatting</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/writer/articles')}
          >
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {/* Save as Draft Button */}
            <Button
              type="button"
              variant="outline"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
              onClick={() => handleSaveDraft(form.getValues())}
              disabled={isSavingDraft}
            >
              {isSavingDraft ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </>
              )}
            </Button>
            
            {mode === 'edit' && initialData && !initialData.is_published && !initialData.is_pending_publish && (
              <Button
                type="button"
                variant="outline"
                className="text-amber-600 border-amber-300 hover:bg-amber-50"
                onClick={handleRequestPublish}
                disabled={!isPublishable || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Request Publish (₹150)
                  </>
                )}
              </Button>
            )}
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </>
              ) : mode === 'edit' ? (
                'Update Article'
              ) : (
                'Create Article'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}