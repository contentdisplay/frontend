// pages/admin/AdminArticleManagementPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Edit, Eye, Loader2, Plus, RefreshCw, Trash2, XCircle } from 'lucide-react';
import adminArticleService, { Article, ArticleStats } from '@/services/admin/adminArticleService';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Don't import SelectContent, SelectItem, SelectTrigger, SelectValue directly
// Instead create a simple custom dropdown to avoid Radix UI focus issues
import { Select } from '@/components/ui/select';

interface ArticleFormData {
  title: string;
  content: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  admin_feedback?: string;
}

// Create a simple custom dropdown component to avoid Radix UI recursion
const StatusDropdown = ({ 
  value, 
  onChange 
}: { 
  value: string, 
  onChange: (value: string) => void 
}) => {
  return (
    <select 
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="draft">Draft</option>
      <option value="pending">Pending Review</option>
      <option value="published">Published</option>
      <option value="rejected">Rejected</option>
    </select>
  );
};

// Create a simple custom filter dropdown
const FilterDropdown = ({ 
  value, 
  onChange 
}: { 
  value: string, 
  onChange: (value: string) => void 
}) => {
  return (
    <select 
      className="flex h-10 w-full sm:w-40 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="all">All Status</option>
      <option value="draft">Draft</option>
      <option value="pending">Pending</option>
      <option value="published">Published</option>
      <option value="rejected">Rejected</option>
    </select>
  );
};

export default function AdminArticleManagementPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [countStats, setCountStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    draft: 0,
    rejected: 0
  });
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackArticle, setFeedbackArticle] = useState<Article | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    status: 'draft'
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get articles and stats on initial load
  useEffect(() => {
    fetchArticles();
    fetchStats();
  }, []);

  // Filter articles when search term or status filter changes
  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, filterStatus]);
  
  // Set count stats when stats change
  useEffect(() => {
    if (stats) {
      // Calculate total articles from all status counts
      const total = stats.status_counts.reduce((sum, item) => sum + item.count, 0);
      
      // Extract specific status counts
      const published = stats.status_counts.find(item => item.status === 'published')?.count || 0;
      const pending = stats.status_counts.find(item => item.status === 'pending')?.count || 0;
      const draft = stats.status_counts.find(item => item.status === 'draft')?.count || 0;
      const rejected = stats.status_counts.find(item => item.status === 'rejected')?.count || 0;
      
      setCountStats({
        total,
        published,
        pending,
        draft,
        rejected
      });
    }
  }, [stats]);
  
  // Fetch article stats
  const fetchStats = async () => {
    try {
      const statsData = await adminArticleService.getArticleStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching article stats:', err);
      toast.error('Failed to fetch article statistics');
    }
  };

  // Fetch all articles or filtered by status
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      let data;
      if (filterStatus !== 'all') {
        data = await adminArticleService.getAllArticles(filterStatus);
      } else {
        data = await adminArticleService.getAllArticles();
      }
      setArticles(data);
    } catch (err) {
      console.error('Error fetching articles:', err);
      toast.error('Failed to fetch articles');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter articles locally based on search term and status
  const filterArticles = useCallback(() => {
    if (!Array.isArray(articles)) {
      setFilteredArticles([]);
      return;
    }

    let filtered = [...articles];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof article?.author === 'string' && article?.author?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (article?.author_name && article?.author_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by status (if not already filtered from API)
    if (filterStatus !== 'all' && !isLoading) {
      filtered = filtered.filter(article => article?.status === filterStatus);
    }
    
    setFilteredArticles(filtered);
  }, [articles, searchTerm, filterStatus, isLoading]);

  // Handle updating article status
  const handleUpdateStatus = async (id: number, status: 'draft' | 'pending' | 'published' | 'rejected') => {
    try {
      await adminArticleService.updateArticleStatus(id, status);
      toast.success(`Article status updated to ${status}`);
      
      // Update article in local state
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === id ? { ...article, status } : article
        )
      );
      
      // Refresh stats after status change
      fetchStats();
    } catch (err) {
      toast.error('Failed to update article status');
      console.error(err);
    }
  };

  // Handle approving an article
  const handleApprove = async (id: number) => {
    try {
      await adminArticleService.approveArticle(id);
      toast.success('Article approved and published');
      
      // Update article in local state
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === id ? { ...article, status: 'published' } : article
        )
      );
      
      // Refresh stats after approval
      fetchStats();
    } catch (err) {
      toast.error('Failed to approve article');
      console.error(err);
    }
  };

  // Handle rejecting an article with feedback
  const handleReject = async (id: number) => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback for rejection');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await adminArticleService.rejectArticle(id, feedback);
      toast.success('Article rejected with feedback');
      
      // Update article in local state
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === id ? { ...article, status: 'rejected' } : article
        )
      );
      
      // Close dialog and reset feedback
      setFeedbackDialogOpen(false);
      setFeedback('');
      setFeedbackArticle(null);
      
      // Refresh stats after rejection
      fetchStats();
    } catch (err) {
      toast.error('Failed to reject article');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding feedback to an article
  const handleAddFeedback = async () => {
    if (!feedbackArticle || !feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await adminArticleService.addFeedback(feedbackArticle.id, feedback);
      toast.success('Feedback added to article');
      
      // Close dialog and reset feedback
      setFeedbackDialogOpen(false);
      setFeedback('');
      setFeedbackArticle(null);
    } catch (err) {
      toast.error('Failed to add feedback');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening delete confirmation dialog
  const handleDeleteClick = (article: Article) => {
    // First set the article, then open the dialog
    setArticleToDelete(article);
    // Use timeout to ensure state update completes
    setTimeout(() => {
      setDeleteDialogOpen(true);
    }, 50);
  };

  // Handle confirming article deletion
  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    
    try {
      await adminArticleService.deleteArticle(articleToDelete.id);
      toast.success('Article deleted successfully');
      
      // Remove article from local state
      setArticles(prevArticles => 
        prevArticles.filter(article => article.id !== articleToDelete.id)
      );
      
      setDeleteDialogOpen(false);
      // Wait before clearing the article state
      setTimeout(() => {
        setArticleToDelete(null);
      }, 200);
      
      // Refresh stats after deletion
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete article');
      console.error(err);
    }
  };

  // Handle opening edit dialog
  const handleEditClick = (article: Article) => {
    // Clone the article data to avoid reference issues
    const articleData = {...article};
    
    // Initialize the form data first
    setFormData({
      title: articleData.title,
      content: articleData.content || '',
      status: articleData.status as 'draft' | 'pending' | 'published' | 'rejected'
    });
    
    // Set the article and open dialog with a delay
    setArticleToEdit(articleData);
    setTimeout(() => {
      setEditDialogOpen(true);
    }, 50);
  };

  // Handle opening feedback dialog
  const handleFeedbackClick = (article: Article) => {
    // Clone the article data to avoid reference issues
    const articleData = {...article};
    
    setFeedback('');
    setFeedbackArticle(articleData);
    
    // Use timeout to ensure state update completes
    setTimeout(() => {
      setFeedbackDialogOpen(true);
    }, 50);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle status change in dropdown
  const handleStatusChange = (value: string) => {
    // Simple value update, no side effects that could cause recursion
    setFormData(prev => ({ 
      ...prev, 
      status: value as 'draft' | 'pending' | 'published' | 'rejected' 
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleToEdit) return;
    
    setIsSubmitting(true);
    try {
      await adminArticleService.updateArticle(articleToEdit.id, formData);
      toast.success('Article updated successfully');
      
      // Update article in local state
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === articleToEdit.id 
            ? { 
                ...article, 
                title: formData.title, 
                content: formData.content,
                status: formData.status
              } 
            : article
        )
      );
      
      // Close dialog and reset state
      setEditDialogOpen(false);
      
      // Wait for dialog to close before resetting article state
      setTimeout(() => {
        setArticleToEdit(null);
      }, 200);
      
      // Refresh stats if status changed
      fetchStats();
    } catch (err) {
      toast.error('Failed to update article');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle viewing an article safely
  const handleViewArticle = async (id: number) => {
    try {
      // Check if the article exists before navigating
      await adminArticleService.getArticleDetails(id);
      navigate(`/admin/articles/${id}`);
    } catch (err) {
      console.error(`Error viewing article ${id}:`, err);
      toast.error('Article not found or cannot be accessed');
    }
  };

  // Get appropriate badge for article status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'published':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Published</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  // Animation variants for each card
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Handle dialog close functions - ensure clean state reset
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    // Reset state after dialog animation completes
    setTimeout(() => {
      setArticleToEdit(null);
    }, 200);
  };

  const handleCloseFeedbackDialog = () => {
    setFeedbackDialogOpen(false);
    // Reset state after dialog animation completes
    setTimeout(() => {
      setFeedback('');
      setFeedbackArticle(null);
    }, 200);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    // Reset state after dialog animation completes
    setTimeout(() => {
      setArticleToDelete(null);
    }, 200);
  };

  // Handle filter status change
  const handleFilterStatusChange = (value: string) => {
    setFilterStatus(value);
    // If changing filter via dropdown, fetch filtered articles from API for better performance
    if (value !== 'all') {
      adminArticleService.getAllArticles(value)
        .then(data => setArticles(data))
        .catch(err => {
          console.error('Error fetching filtered articles:', err);
          toast.error('Failed to filter articles');
        });
    } else {
      // If selecting "all", fetch all articles
      fetchArticles();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
            Content Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage, review, and publish articles
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Button 
            onClick={() => {
              fetchArticles();
              fetchStats();
            }} 
            variant="outline" 
            size="sm" 
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link 
            to="/admin/articles/create" 
            className={buttonVariants({ variant: "default", size: "sm", className: "flex items-center" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-md bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{countStats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{countStats.published}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-yellow-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{countStats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{countStats.draft}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader>
          <CardTitle className="text-xl">Articles</CardTitle>
          <CardDescription>
            Manage all articles in the system
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-grow">
              <Input
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* Replace Radix UI Select with simple custom dropdown */}
            <FilterDropdown 
              value={filterStatus} 
              onChange={handleFilterStatusChange} 
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No articles found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {searchTerm || filterStatus !== 'all' 
                  ? "Try adjusting your search or filter criteria"
                  : "Start by creating a new article"}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="overflow-x-auto"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <motion.tr key={article.id} variants={itemVariants}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>{typeof article.author === 'string' ? article.author : article.author_name}</TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* View action - safely handle navigation */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="View"
                            onClick={() => handleViewArticle(article.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Edit action */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditClick(article)} 
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {/* Delete action */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(article)} 
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          {/* Send for review action (for drafts) */}
                          {article.status === 'draft' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdateStatus(article.id, 'pending')}
                            >
                              Send for Review
                            </Button>
                          )}
                          
                          {/* Approve/Reject actions (for pending) */}
                          {article.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(article.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleFeedbackClick(article)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          
                          {/* Add feedback action (for any article) */}
                          {article.status !== 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleFeedbackClick(article)}
                              className="ml-2"
                            >
                              Add Feedback
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {articleToDelete && (
        <Dialog 
          open={deleteDialogOpen} 
          onOpenChange={handleCloseDeleteDialog}
          modal // Force modal mode to prevent focus issues
        >
          <DialogContent onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{articleToDelete?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCloseDeleteDialog}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Article Dialog */}
      {articleToEdit && (
        <Dialog 
          open={editDialogOpen} 
          onOpenChange={handleCloseEditDialog}
          modal // Force modal mode to prevent focus issues
        >
          <DialogContent 
            className="max-w-3xl"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Edit Article</DialogTitle>
              <DialogDescription>
                Make changes to the article details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Article title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    placeholder="Article content"
                    rows={8}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  {/* Replace Radix UI Select with simple custom dropdown */}
                  <StatusDropdown
                    value={formData.status}
                    onChange={handleStatusChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={handleCloseEditDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Feedback Dialog */}
      {feedbackArticle && (
        <Dialog 
          open={feedbackDialogOpen} 
          onOpenChange={handleCloseFeedbackDialog}
          modal // Force modal mode to prevent focus issues
        >
          <DialogContent onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>
                {feedbackArticle?.status === 'pending' ? 'Reject Article' : 'Add Feedback'}
              </DialogTitle>
              <DialogDescription>
                {feedbackArticle?.status === 'pending' 
                  ? 'Provide feedback about why this article is being rejected.'
                  : 'Add editorial feedback to this article.'}
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
              <Button variant="outline" onClick={handleCloseFeedbackDialog}>
                Cancel
              </Button>
              {feedbackArticle?.status === 'pending' ? (
                <Button
                  variant="destructive"
                  onClick={() => handleReject(feedbackArticle.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Article'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleAddFeedback}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}