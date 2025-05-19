// pages/admin/ArticleApprovalPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import adminArticleService, { Article } from '@/services/admin/adminArticleService';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ClipboardCheck, 
  Clock, 
  User, 
  FileText, 
  Tags, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function ArticleApprovalPage() {
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchPendingArticles = async () => {
      try {
        setIsLoading(true);
        const data = await adminArticleService.getPendingArticles();
        setPendingArticles(data);
      } catch (error) {
        console.error('Failed to fetch pending articles:', error);
        toast.error('Failed to load pending articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingArticles();
  }, []);

  const handleApprove = async (article: Article) => {
    try {
      setActiveArticle(article);
      setIsApproving(true);
      await adminArticleService.approveArticle(article.id);
      setPendingArticles(pendingArticles.filter(a => a.id !== article.id));
      toast.success(`Article "${article.title}" approved and published`);
    } catch (error) {
      console.error('Failed to approve article:', error);
      toast.error('Failed to approve article');
    } finally {
      setIsApproving(false);
      setActiveArticle(null);
    }
  };

  const handleReject = async (article: Article) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setActiveArticle(article);
      setIsRejecting(true);
      await adminArticleService.rejectArticle(article.id, rejectionReason);
      setPendingArticles(pendingArticles.filter(a => a.id !== article.id));
      toast.success(`Article "${article.title}" rejected`);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject article:', error);
      toast.error('Failed to reject article');
    } finally {
      setIsRejecting(false);
      setActiveArticle(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
              <ClipboardCheck className="mr-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Article Approval Queue
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve writer submissions
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-amber-100 dark:border-amber-900/30">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : pendingArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingArticles.map(article => (
              <Card 
                key={article.id} 
                className="border-amber-100 dark:border-amber-900/30"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-500 text-white">Pending</Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(article.created_at)}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold mt-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <User className="mr-1 h-4 w-4" />
                    <span className="mr-4">{typeof article.author === 'string' ? article.author : article.author_name}</span>
                    <FileText className="mr-1 h-4 w-4" />
                    <span>{article.word_count} words</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                    {article.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Tags className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                    {article.tags && article.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                        {tag}
                      </Badge>
                    ))}
                    {article.tags && article.tags.length > 3 && (
                      <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                        +{article.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">{article.title}</DialogTitle>
                        <DialogDescription>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <User className="mr-1 h-4 w-4" />
                            <span className="mr-4">{typeof article.author === 'string' ? article.author : article.author_name}</span>
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{formatDate(article.created_at)}</span>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <h4 className="text-lg font-medium mb-2">Description:</h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {article.description}
                        </p>
                        <h4 className="text-lg font-medium mb-2">Content:</h4>
                        <div 
                          className="prose max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-base prose-blockquote:border-l-indigo-600 prose-blockquote:text-gray-600 dark:prose-blockquote:border-l-indigo-400 dark:prose-blockquote:text-gray-400 prose-blockquote:not-italic"
                          dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                      </div>
                      <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => {}}>
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="border-red-300 text-red-600">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Article</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject this article? This will return ₹75 to the author's wallet.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <label className="text-sm font-medium">
                            Reason for Rejection (will be sent to the author):
                          </label>
                          <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="mt-2"
                            placeholder="Provide feedback on why this article was rejected..."
                            rows={4}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setRejectionReason('')}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleReject(article)}
                            disabled={isRejecting && activeArticle?.id === article.id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isRejecting && activeArticle?.id === article.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Rejecting...
                              </>
                            ) : (
                              'Reject Article'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button 
                      onClick={() => handleApprove(article)}
                      disabled={isApproving && activeArticle?.id === article.id}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isApproving && activeArticle?.id === article.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 p-8 text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                No pending articles
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                All submitted articles have been reviewed. Check back later for new submissions.
              </p>
              <Button asChild>
                <Link to="/admin/dashboard">
                  Return to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}