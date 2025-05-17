const handleFilter = (filter: string) => {
  setActiveFilter(filter);
  setSortBy(filter);
  // Reset to first page when changing filters
  setCurrentPage(1);
};

const handlePageChange = (page: number) => {
  const currentTotalPages = getCurrentTotalPages();
  if (page < 1 || page > currentTotalPages) return;
  setCurrentPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};// pages/articles/ArticlesListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
Heart,
RefreshCw
} from 'lucide-react';
import { ArticleList } from '@/components/articles/ArticleList';
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
SheetTrigger,
SheetFooter
} from '@/components/ui/sheet';
import { 
Select, 
SelectContent, 
SelectItem, 
SelectTrigger, 
SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';

export default function ArticlesListPage() {
const navigate = useNavigate();
const { toast } = useToast();
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
const [isRefreshing, setIsRefreshing] = useState(false);

const fetchData = useCallback(async () => {
  try {
    setIsLoading(true);
    
    // Fetch trending articles (most read)
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
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load articles. Please try again.",
    });
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
  }
}, [currentPage, pageSize, toast]);

useEffect(() => {
  fetchData();
}, [fetchData]);

const handleRefresh = () => {
  setIsRefreshing(true);
  fetchData();
};

const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  // Reset to first page when searching
  setCurrentPage(1);
};

// Pagination handling for different tabs
const handleTabChange = (tabValue: string) => {
  setActiveTab(tabValue);
  // Reset current page when changing tabs
  setCurrentPage(1);
};

// Get filtered articles with pagination
const getFilteredArticlesWithPagination = () => {
  const filtered = filterArticles();
  
  // For the 'all' tab, we use server-side pagination
  if (activeTab === 'all' && !searchQuery && !tagFilter) {
    return filtered;
  }
  
  // For other tabs or when filtering, we need to handle pagination client-side
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  
  return filtered.slice(startIdx, endIdx);
};

// Calculate total pages for client-side pagination
const getClientSideTotalPages = () => {
  const filteredCount = filterArticles().length;
  return Math.ceil(filteredCount / pageSize);
};

// Get the current total pages based on active tab and filters
const getCurrentTotalPages = () => {
  if (activeTab === 'all' && !searchQuery && !tagFilter) {
    return totalPages;
  }
  return getClientSideTotalPages();
};

const handleArticleClick = (slug: string) => {
  navigate(`/articles/${slug}`);
};

const clearFilters = () => {
  setTagFilter('');
  setSearchQuery('');
  setActiveTab('all');
  setSortBy('latest');
  setActiveFilter('latest');
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
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }
  
  // Apply tag filter
  if (tagFilter) {
    filtered = filtered.filter(article => 
      article.tags && article.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase())
    );
  }
  
  // Apply sort
  switch (sortBy) {
    case 'trending':
      filtered.sort((a, b) => b.total_reads - a.total_reads);
      break;
    case 'rewards':
      filtered.sort((a, b) => (b.reward || 0) - (a.reward || 0));
      break;
    case 'most-liked':
      filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
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
    if (article.tags) {
      article.tags.forEach(tag => tagsSet.add(tag.toLowerCase()));
    }
  });
  return Array.from(tagsSet).sort();
};

// Calculate pagination range based on current page and total pages
const getPaginationRange = () => {
  const range = [];
  const maxPagesToShow = 5;
  const currentTotalPages = getCurrentTotalPages();
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(currentTotalPages, startPage + maxPagesToShow - 1);
  
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
        
        <div className="w-full md:w-auto flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <Input 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-10">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Filters</span>
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
              </div>
              <SheetFooter className="mt-4">
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
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
                onClick={clearFilters}
              >
                Clear All
              </Button>
            </div>
          )}
          
          <ArticleList
            articles={getFilteredArticlesWithPagination()}
            isLoading={isLoading}
            bookmarkedArticles={bookmarkedArticles}
            likedArticles={likedArticles}
            setBookmarkedArticles={setBookmarkedArticles}
            setLikedArticles={setLikedArticles}
            emptyMessage={
              activeTab === 'bookmarked' 
                ? "You haven't bookmarked any articles yet" 
                : activeTab === 'liked' 
                  ? "You haven't liked any articles yet" 
                  : "No articles match your current filters"
            }
            onClearFilters={clearFilters}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {!isLoading && getFilteredArticlesWithPagination().length > 0 && getCurrentTotalPages() > 1 && (
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
            
            {currentPage < getCurrentTotalPages() - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            
            {currentPage < getCurrentTotalPages() - 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(getCurrentTotalPages())}>
                  {getCurrentTotalPages()}
                </PaginationLink>
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(currentPage + 1)}
                className={currentPage === getCurrentTotalPages() ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </motion.div>
  </div>
);
}