import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import articleService from '@/services/articleService';
import { motion } from 'framer-motion';

interface Article {
  id: number;
  title: string;
  slug: string;
  author: { username: string };
}

export default function PendingApprovalsPage() {
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchPendingArticles();
  }, []);

  const fetchPendingArticles = async () => {
    try {
      const data = await articleService.getPendingArticles();
      setPendingArticles(data);
    } catch (err) {
      toast.error('Failed to fetch pending articles');
    }
  };

  const handleApprove = async (slug: string) => {
    try {
      await articleService.approveArticle(slug);
      toast.success('Article approved successfully');
      fetchPendingArticles();
    } catch (err) {
      toast.error('Failed to approve article');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
        Pending Article Approvals
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader>
            <CardTitle>Pending Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>{article.title}</TableCell>
                    <TableCell>{article.author.username}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleApprove(article.slug)} className="mr-2">
                        Approve
                      </Button>
                      <Button variant="destructive">
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}