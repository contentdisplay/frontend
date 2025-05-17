import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminArticleService from '@/services/admin/adminArticleService';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Edit, 
  Eye, 
  FileText, 
  Loader2, 
  MessageSquare,
  Trash2, 
  User, 
  XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: number;
  author_name: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
  published_at: string | null;
  thumbnail?: string | null;
  total_reads: number;
  total_likes: number;
  likes_count: number;
  bookmarks_count: number;
  word_count: number;
  tags?: string[];
  admin_feedback?: string;
}

export function AdminArticleDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticleDetails(parseInt(id));
    }
  }, [id]);

  const fetchArticleDetails = async (articleId: number) => {
    try {
      setIsLoading(true);
      const data = await adminArticleService.getArticleDetails(articleId);
      setArticle(data);
      if (data.admin_feedback) {
        setFeedback(data.admin_feedback);
      }
    } catch (error) {
      console.error('Failed to fetch article details:', error);
      toast.error('Failed to load article details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!article) return;
    
    try {
      setIsApproving(true);
      await adminArticleService.approveArticle(article.id);
      
      // Refetch article to get updated status
      await fetchArticleDetails(article.id);
      
      toast.success('Article approved and published');
    } catch (error) {
      console.error('Failed to approve article:', error);
      toast.error('Failed to approve article');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!article) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setIsRejecting(true);
      await adminArticleService.rejectArticle(article.id, rejectionReason);
      
      // Refetch article to get updated status
      await fetchArticleDetails(article.id);
      
      toast.success('Article rejected');
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject article:', error);
      toast.error('Failed to reject article');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!article) return;
    
    try {
      setIsDeleting(true);
      await adminArticleService.deleteArticle(article.id);
      toast.success('Article deleted successfully');
      
      // Navigate back to articles list
      navigate('/admin/articles');
    } catch (error) {
      console.error('Failed to delete article:', error);
      toast.error('Failed to delete article');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (status: 'draft' | 'pending' | 'published' | 'rejected') => {
    if (!article) return;
    
    try {
      await adminArticleService.updateArticleStatus(article.id, status);
      
      // Refetch article to get updated status
      await fetchArticleDetails(article.id);
      
      toast.success(`Article status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update article status:', error);
      toast.error('Failed to update article status');
    }
  };

  const handleAddFeedback = async () => {
    if (!article || !feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }
    
    try {
      setIsSubmittingFeedback(true);
      await adminArticleService.addFeedback(article.id, feedback);
      
      // Update local state
      setArticle(prev => prev ? { ...prev, admin_feedback: feedback } : null);
      
      toast.success('Feedback added to article');
      setFeedbackDialogOpen(false);
    } catch (error) {
      console.error('Failed to add feedback:', error);
      toast.error('Failed to add feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM dd, yyyy • h:mm a');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The article you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate('/admin/articles')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/articles')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              {getStatusBadge(article.status)}
              <h1 className="text-2xl font-bold">{article.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <User className="mr-1 h-4 w-4" />
                <span>{article.author_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div className="flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                <span>{article.word_count || 'N/A'} words</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {article.status === 'pending' && (
            <>
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
                      Are you sure you want to reject this article? Please provide feedback for the author.
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
                      onClick={handleReject}
                      disabled={isRejecting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isRejecting ? (
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
                onClick={handleApprove}
                disabled={isApproving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isApproving ? (
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
            </>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Feedback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Feedback</DialogTitle>
                <DialogDescription>
                  Provide editorial feedback for this article. This will be visible to the author.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback here..."
                  rows={5}
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFeedback}
                  disabled={isSubmittingFeedback}
                >
                  {isSubmittingFeedback ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-300 text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this article? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Article'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Article Content</CardTitle>
                <div className="flex gap-2">
                  {article.status !== 'published' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-emerald-600 border-emerald-300"
                      onClick={() => handleStatusChange('published')}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Publish
                    </Button>
                  )}
                  {article.status !== 'draft' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleStatusChange('draft')}
                    >
                      Set as Draft
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="mt-2" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="raw">Raw Content</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="min-h-[400px]">
                  <div 
                    className="prose max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-base prose-blockquote:border-l-indigo-600 prose-blockquote:text-gray-600 dark:prose-blockquote:border-l-indigo-400 dark:prose-blockquote:text-gray-400 prose-blockquote:not-italic"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </TabsContent>
                
                <TabsContent value="raw" className="min-h-[400px]">
                  <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800 overflow-auto min-h-[400px]">
                    <pre className="text-sm whitespace-pre-wrap">{article.content}</pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Feedback Section */}
          {article.admin_feedback && (
            <Card className="mt-6 border-purple-100 dark:border-purple-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-purple-500" />
                  Editorial Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {article.admin_feedback}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFeedbackDialogOpen(true)}
                >
                  Edit Feedback
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <p className="flex items-center mt-1">
                  {getStatusBadge(article.status)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Author</p>
                <p className="mt-1 flex items-center">
                  <User className="h-4 w-4 mr-1 text-gray-500" />
                  {article.author_name}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                <p className="mt-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  {formatDate(article.created_at)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="mt-1 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  {formatDate(article.updated_at)}
                </p>
              </div>
              
              {article.published_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</p>
                  <p className="mt-1 flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-gray-500" />
                    {formatDate(article.published_at)}
                  </p>
                </div>
              )}
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Word Count</p>
                  <p className="mt-1 text-xl font-semibold">{article.word_count || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reads</p>
                  <p className="mt-1 text-xl font-semibold">{article.total_reads || 0}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Likes</p>
                  <p className="mt-1 text-xl font-semibold">{article.likes_count || 0}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bookmarks</p>
                  <p className="mt-1 text-xl font-semibold">{article.bookmarks_count || 0}</p>
                </div>
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {article.status !== 'published' && (
                  <Button 
                    className="w-full justify-start bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleStatusChange('published')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Publish Article
                  </Button>
                )}
                
                {article.status !== 'draft' && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleStatusChange('draft')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Set as Draft
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setFeedbackDialogOpen(true)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {article.admin_feedback ? 'Edit Feedback' : 'Add Feedback'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Article
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Article
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Article</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this article? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Article'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}