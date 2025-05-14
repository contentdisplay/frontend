// pages/writer/ArticleCreatePage.tsx
import React from 'react';
import ArticleForm from '@/components/articles/ArticleForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArticleFormData } from '@/services/contentWriterService';


export default function ArticleCreatePage() {
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
      
      <ArticleForm mode="create" onSubmit={function (data: ArticleFormData): Promise<void> {
        throw new Error('Function not implemented.');
      } } isSubmitting={false} />
    </div>
  );
}