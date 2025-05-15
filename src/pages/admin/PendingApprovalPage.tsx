// pages/admin/AdminArticleApprovalPage.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Eye, Loader2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import articleService, { Article } from '@/services/articleService';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminArticleApprovalPage() {
  const navigate = useNavigate();
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingArticles();
  }, []);

  const fetchPendingArticles = async () => {
    try {
      setIsLoading(true);
      const data = await articleService.getPendingArticles();
      setPendingArticles(data);
    } catch (err) {
      console.error('Failed to fetch pending articles:', err);
      toast.error('Failed to fetch pending articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClick = (article: Article) => {
    setSelectedArticle(article);
    setShowApproveDialog(true);
  };

  const handleRejectClick = (article: Article) => {
    setSelectedArticle(article);
    setShowRejectDialog(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedArticle) return;
    
    try {
      setIsSubmitting(true);
      await articleService.approveArticle(selectedArticle.slug);
      toast.success('Article approved and published successfully');
      
      // Remove article from pending list
      setPendingArticles(prev => 
        prev.filter(article => article.id !== selectedArticle.id)
      );
      
      setShowApproveDialog(false);
    } catch (err) {
      console.error('Failed to approve article:', err);
      toast.error('Failed to approve article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedArticle) return;
    
    try {
      setIsSubmitting(true);
      // Implement rejection API call when available
      // For now, just remove from pending list
      setPendingArticles(prev => 
        prev.filter(article => article.id !== selectedArticle.id)
      );
      
      toast.success('Article rejected successfully');
      setShowRejectDialog(false);
    } catch (err) {
      console.error('Failed to reject article:', err);
      toast.error('Failed to reject article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            Pending Article Approvals
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Review and approve submitted articles for publication
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={fetchPendingArticles}
            className="flex items-center"
          >
            <svg 
              className="mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              // pages/admin/AdminArticleApprovalPage.tsx (continued)
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader>
            <CardTitle>Pending Articles</CardTitle>
            <CardDescription>
              Review articles submitted by content writers for publication
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : pendingArticles.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No pending articles</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  All submitted articles have been reviewed
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {article.title}
                        </TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>
                          {new Date(article.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/articles/${article.slug}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApproveClick(article)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleRejectClick(article)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Article</DialogTitle>
            <DialogDescription>
              The article will be published and made visible to all users.
            </DialogDescription>
          </DialogHeader>
          
          {selectedArticle && (
            <div className="space-y-4 my-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="font-medium text-lg">{selectedArticle.title}</h3>
                <p className="text-sm text-gray-500 mt-1">By {selectedArticle.author}</p>
                <Separator className="my-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedArticle.description}
                </p>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>This article has {selectedArticle.word_count} words and will be rewarded with ₹{selectedArticle.reward.toFixed(2)} per read.</p>
                <p className="mt-1">The author has already paid the publishing fee of ₹150.00.</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApproveConfirm} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                  Approving...
                </>
              ) : (
                'Approve & Publish'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Article</DialogTitle>
            <DialogDescription>
              The article will be rejected and not published. The publishing fee will not be refunded.
            </DialogDescription>
          </DialogHeader>
          
          {selectedArticle && (
            <div className="space-y-4 my-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="font-medium text-lg">{selectedArticle.title}</h3>
                <p className="text-sm text-gray-500 mt-1">By {selectedArticle.author}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRejectConfirm} 
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                  Rejecting...
                </>
              ) : (
                'Reject Article'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}