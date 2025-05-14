// components/articles/ArticleForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Article } from '@/services/articleService';
import { ArticleFormData } from '@/services/contentWriterService';
import { X, UploadCloud, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Using React-Quill for rich text editor
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const articleFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' }),
  content: z.string().min(100, { message: 'Content must be at least 100 characters long' }),
  tags: z.array(z.string()).min(1, { message: 'At least one tag is required' })
});

type ArticleFormProps = {
  onSubmit: (data: ArticleFormData) => Promise<void>;
  initialData?: Article;
  isSubmitting: boolean;
  mode: 'create' | 'edit'; 
  article?: Article;
};

export default function ArticleForm({ onSubmit, initialData, isSubmitting }: ArticleFormProps) {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnail || null
  );
  const [tagInput, setTagInput] = useState('');

  const form = useForm<z.infer<typeof articleFormSchema>>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      tags: initialData?.tags || []
    }
  });

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
    form.setValue('tags', currentTags.filter(t => t !== tag));
    form.trigger('tags');
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values: z.infer<typeof articleFormSchema>) => {
    const formData: ArticleFormData = {
      title: values.title,
      description: values.description,
      content: values.content,
      tags: values.tags,
      thumbnail: thumbnail || undefined
    };
    
    await onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Thumbnail upload */}
        <div className="space-y-2">
          <FormLabel>Thumbnail Image</FormLabel>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
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
                  // components/articles/ArticleForm.tsx (continued)
                >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center space-y-2 cursor-pointer w-full">
              <UploadCloud className="h-12 w-12 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Click to upload thumbnail</span>
              <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
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
            <FormDescription>
              A catchy title that describes your article
            </FormDescription>
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
            <FormDescription>
              A short introduction that will appear in previews
            </FormDescription>
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
              <Button 
                type="button" 
                onClick={handleAddTag}
              >
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
            <FormDescription>
              Add relevant tags to help readers find your article
            </FormDescription>
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
                className="min-h-[200px] rounded-md"
              />
            </FormControl>
            <FormDescription>
              Write your article content with rich formatting
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
              {initialData ? 'Updating...' : 'Publishing...'}
            </>
          ) : initialData ? 'Update Article' : 'Create Article'}
        </Button>
      </div>
    </form>
  </Form>
);
}