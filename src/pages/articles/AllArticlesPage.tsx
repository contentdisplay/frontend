// pages/articles/ArticlesListPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  Clock, 
  Filter, 
  Bookmark, 
  Heart 
} from 'lucide-react';
import ArticleCard from '@/components/articles/ArticleCard';
import { toast } from 'sonner';
import articleService, { Article } from '@/services/articleService';
import { motion } from 'framer-motion';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ArticlesListPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('latest');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<number[]>([]);
  const [likedArticles, setLikedArticles] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const pageSize = 9;

  // Filter states
  const [tagFilter, setTagFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trending articles
        const trendingData = await articleService.getTrendingArticles();
        setTrendingArticles(trendingData);
        
        // Fetch regular articles with pagination
        const { results, count } = await articleService.getPublishedArticles(currentPage, pageSize);
        setArticles(results);
        setTotalArticles(count);
        setTotalPages(Math.ceil(count / pageSize));
        
        // Get bookmarked articles
        const bookmarked = await articleService.getBookmarkedArticles();
        setBookmarkedArticles(bookmarked.map(b => b.article));
        
        // Get liked articles
        const liked = await articleService.getLikedArticles();
        setLikedArticles(liked.map(l => l.article));
      } catch (error) {
        console.error('Failed to fetch articles:', error);
        toast.error('Failed to load articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    toast.info(`Searching for: ${searchQuery}`);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    setSortBy(filter);
    // Reset to first page when changing filters
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArticleClick = (slug: string) => {
    navigate(`/articles/${slug}`);
  };

  const filterArticles = () => {
    let filtered = [...articles];
    
    // Apply tab filter
    if (activeTab === 'bookmarked') {
      filtered = filtered.filter(article => bookmarkedArticles.includes(article.id));
    } else if (activeTab === 'liked') {
      filtered = filtered.filter(article => likedArticles.includes(article.id));
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply tag filter
    if (tagFilter) {
      filtered = filtered.filter(article => 
        article.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase())
      );
    }
    
    // Apply sort
    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => b.normal_user_reads - a.normal_user_reads);
        break;
      case 'rewards':
        filtered.sort((a, b) => b.reward - a.reward);
        break;
      case 'most-liked':
        filtered.sort((a, b) => b.likes_count - a.likes_count);
        break;
      case 'latest':
      default:
        // Already sorted by latest from the API
        break;
    }
    
    return filtered;
  };

  // Get all unique tags from articles
  const getAllTags = () => {
    const tagsSet = new Set<string>();
    articles.forEach(article => {
      article.tags.forEach(tag => tagsSet.add(tag.toLowerCase()));
    });
    return Array.from(tagsSet).sort();
  };
  
  // Calculate pagination range
  const getPaginationRange = () => {
    const range = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Explore Articles
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover insights, earn rewards, and engage with content
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64"
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Articles</SheetTitle>
                    <SheetDescription>
                      Customize your article feed
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sort option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest">Latest</SelectItem>
                          <SelectItem value="trending">Most Read</SelectItem>
                          <SelectItem value="rewards">Highest Rewards</SelectItem>
                          <SelectItem value="most-liked">Most Liked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Filter by Tag</Label>
                      <Select value={tagFilter} onValueChange={setTagFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tag" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Tags</SelectItem>
                          {getAllTags().map(tag => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={() => {
                        setSortBy('latest');
                        setTagFilter('');
                        setSearchQuery('');
                      }}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </form>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeFilter === 'latest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilter('latest')}
            className={activeFilter === 'latest' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            <Clock className="mr-1 h-4 w-4" />
            Latest
          </Button>
          <Button
            variant={activeFilter === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilter('trending')}
            className={activeFilter === 'trending' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            <TrendingUp className="mr-1 h-4 w-4" />
            Trending
          </Button>
          <Button
            variant={activeFilter === 'rewards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilter('rewards')}
            className={activeFilter === 'rewards' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            <Filter className="mr-1 h-4 w-4" />
            Highest Rewards
          </Button>
          <Button
            variant={activeFilter === 'most-liked' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilter('most-liked')}
            className={activeFilter === 'most-liked' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            <Heart className="mr-1 h-4 w-4" />
            Most Liked
          </Button>
        </div>

        {/* Trending Section */}
        {!isLoading && trendingArticles.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Trending Articles
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingArticles.slice(0, 3).map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isBookmarked={bookmarkedArticles.includes(article.id)}
                  isLiked={likedArticles.includes(article.id)}
                  setBookmarkedArticles={setBookmarkedArticles}
                  setLikedArticles={setLikedArticles}
                  onClick={() => handleArticleClick(article.slug)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Articles Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Articles</TabsTrigger>
            <TabsTrigger value="bookmarked">
              <Bookmark className="mr-1 h-4 w-4" />
              Bookmarked
            </TabsTrigger>
            <TabsTrigger value="liked">
              <Heart className="mr-1 h-4 w-4" />
              Liked
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {/* Active Filters Display */}
            {(tagFilter || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchQuery}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 rounded-full"
                      onClick={() => setSearchQuery('')}
                    >
                      &times;
                    </Button>
                  </Badge>
                )}
                {tagFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Tag: {tagFilter}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 rounded-full"
                      onClick={() => setTagFilter('')}
                    >
                      &times;
                    </Button>
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm h-6"
                  onClick={() => {
                    setTagFilter('');
                    setSearchQuery('');
                  }}
                >
                  Clear All
                </Button>
              </div>
            )}
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filterArticles().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterArticles().map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    isBookmarked={bookmarkedArticles.includes(article.id)}
                    isLiked={likedArticles.includes(article.id)}
                    setBookmarkedArticles={setBookmarkedArticles}
                    setLikedArticles={setLikedArticles}
                    onClick={() => handleArticleClick(article.slug)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {activeTab === 'bookmarked' 
                    ? "You haven't bookmarked any articles yet" 
                    : activeTab === 'liked' 
                      ? "You haven't liked any articles yet" 
                      : "No articles match your current filters"}
                </p>
                <Button 
                  onClick={() => {
                    setTagFilter('');
                    setSearchQuery('');
                    setActiveTab('all');
                    setSortBy('latest');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {!isLoading && activeTab === 'all' && filterArticles().length > 0 && totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                </PaginationItem>
              )}
              
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              {getPaginationRange().map(page => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    isActive={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              {currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </motion.div>
    </div>
  );
}