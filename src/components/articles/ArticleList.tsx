import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, BookOpen, CheckCircle, Clock, Edit, Wallet, Trash2, Eye,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle
} from 'lucide-react';
import { Article } from '@/services/articleService';
import { Select } from '@/components/ui/select';

interface ArticleListProps {
  articles: Article[];
  isLoading: boolean;
  variant?: 'default' | 'compact';
  onRequestPublish?: (id: number) => void;
  onEdit?: (article: Article) => void;
  onDelete?: (article: Article) => void;
  showControls?: boolean;
}

export function ArticleList({
  articles,
  isLoading,
  variant = 'default',
  onRequestPublish,
  onEdit,
  onDelete,
  showControls = true
}: ArticleListProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '9', 10));
  const [totalPages, setTotalPages] = useState(1);

  // Initialize pagination when articles change
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(articles.length / pageSize)));
    
    // Ensure current page is valid
    if (currentPage > Math.ceil(articles.length / pageSize)) {
      setCurrentPage(1);
    }
  }, [articles, pageSize]);

  // Update URL when pagination changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', currentPage.toString());
    newParams.set('size', pageSize.toString());
    setSearchParams(newParams, { replace: true });
  }, [currentPage, pageSize]);
  
  const statusColors = {
    draft: "bg-blue-100 text-blue-800 border-blue-300",
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    published: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300"
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    if (status === 'draft') return 'Draft';
    if (status === 'pending') return 'Pending Review';
    if (status === 'published') return 'Published';
    if (status === 'rejected') return 'Rejected';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'draft') return <Edit className="h-3 w-3 mr-1" />;
    if (status === 'pending') return <Clock className="h-3 w-3 mr-1" />;
    if (status === 'published') return <CheckCircle className="h-3 w-3 mr-1" />;
    if (status === 'rejected') return <AlertCircle className="h-3 w-3 mr-1" />;
    return null;
  };

  const truncate = (text: string, length: number) => {
    if (!text) return '';
    return text.length <= length ? text : text.substring(0, length) + '...';
  };
  
  // Strip HTML tags from content
  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };
  
  const handleViewArticle = (article: Article) => {
    navigate(`/articles/${article.slug}`);
  };
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    // Ensure page is within bounds
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    
    // Scroll to top of the page when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  // Get current page of articles
  const getCurrentArticles = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return articles.slice(startIndex, endIndex);
  };
  
  // Generate page numbers for navigation
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Show at most 5 page numbers
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  // Create the Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {Math.min(articles.length, (currentPage - 1) * pageSize + 1)} - {Math.min(articles.length, currentPage * pageSize)} of {articles.length} articles
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="hidden sm:flex"
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {getPageNumbers().map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className={`${currentPage === page ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'text-gray-700 dark:text-gray-300'} 
                         hidden sm:block`}
              aria-current={currentPage === page ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </Button>
          ))}
          
          <span className="text-sm sm:hidden">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="hidden sm:flex"
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Items per page:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="h-8 px-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Items per page"
          >
            <option value="6">6</option>
            <option value="9">9</option>
            <option value="12">12</option>
            <option value="24">24</option>
          </select>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 ${variant === 'compact' ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
        {Array.from({ length: pageSize }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="w-full h-48">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex gap-2 pt-2 border-t">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-12" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // Get current page of articles to display
  const currentArticles = getCurrentArticles();
  
  const renderArticleGrid = () => {
    const gridClass = variant === 'compact' 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
      
    if (currentArticles.length === 0) {
      return (
        <div className="w-full py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">No articles found</p>
        </div>
      );
    }
    
    if (variant === 'compact') {
      return (
        <div className={gridClass}>
          {currentArticles.map(article => (
            <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {article.thumbnail && (
                <div className="w-full h-40 overflow-hidden cursor-pointer" onClick={() => handleViewArticle(article)}>
                  <img 
                    src={article.thumbnail} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <CardHeader className="pb-1 pt-4">
                <div className="flex justify-between">
                  <Badge className={`${getStatusColor(article.status)} flex items-center`}>
                    {getStatusIcon(article.status)}
                    {getStatusText(article.status)}
                  </Badge>
                  <div className="flex space-x-1">
                    <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {article.total_likes || 0}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-base mt-2 line-clamp-1 cursor-pointer" onClick={() => handleViewArticle(article)}>
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {stripHtml(article.content)}
                </p>
              </CardContent>
              <CardFooter className="pt-2 pb-4 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  onClick={() => handleViewArticle(article)}
                >
                  <Eye className="h-3.5 w-3.5 mr-2" />
                  Read Article
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }
    
    return (
      <div className={gridClass}>
        {currentArticles.map(article => (
          <Card key={article.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
            {article.thumbnail && (
              <div className="w-full h-48 overflow-hidden cursor-pointer" onClick={() => handleViewArticle(article)}>
                <img 
                  src={article.thumbnail} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge className={`${getStatusColor(article.status)} flex items-center`}>
                  {getStatusIcon(article.status)}
                  {getStatusText(article.status)}
                </Badge>
                <div className="flex space-x-1">
                  <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    {article.total_likes || 0}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {article.total_reads || 0}
                  </Badge>
                </div>
              </div>
              <CardTitle 
                className="text-lg mt-2 line-clamp-2 cursor-pointer" 
                onClick={() => handleViewArticle(article)}
              >
                {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                <div className="flex justify-between mb-1">
                  <span>Word Count:</span>
                  <span className={article.word_count < 100 ? "text-red-500" : article.word_count < 500 ? "text-amber-500" : "text-green-500"}>
                    {article.word_count || 0} words
                  </span>
                </div>
                {article.reward !== undefined && (
                  <div className="flex justify-between">
                    <span>Reward Points:</span>
                    <span className="text-amber-600">{article.reward.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="mb-2 h-20 overflow-hidden text-sm text-gray-600 dark:text-gray-300">
                {/* Strip HTML and truncate content */}
                {stripHtml(article.content)
                  ? truncate(stripHtml(article.content), 150)
                  : "No content available."
                }
              </div>
            </CardContent>
            {showControls && (
              <CardFooter className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => onEdit ? onEdit(article) : handleViewArticle(article)}
                >
                  {onEdit ? (
                    <>
                      <Edit className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      View
                    </>
                  )}
                </Button>
                
                {article.status === 'draft' && onRequestPublish && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                    onClick={() => onRequestPublish(article.id)}
                  >
                    <Wallet className="h-3.5 w-3.5 mr-2" />
                    Publish
                  </Button>
                )}
                
                {onDelete && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => onDelete(article)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {renderArticleGrid()}
      <Pagination />
    </div>
  );
}