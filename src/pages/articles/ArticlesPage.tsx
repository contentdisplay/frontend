import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  Tag, 
  TrendingUp, 
  Bookmark, 
  Heart, 
  X,
  FileText,
  RefreshCw 
} from "lucide-react";
import { toast } from "sonner";
import articleService, { Article } from "@/services/articleService";
import ArticleCard from "@/components/articles/ArticleCard";
import { cn } from "@/lib/utils";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);
  const [likedArticleIds, setLikedArticleIds] = useState<number[]>([]);
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState<number[]>([]);
  
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLikesLoading, setIsLikesLoading] = useState(true);
  const [isBookmarksLoading, setIsBookmarksLoading] = useState(true);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("all");

  // Load all required data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsTrendingLoading(true);
    setIsLikesLoading(true);
    setIsBookmarksLoading(true);
    
    try {
      // Load published articles
      const articlesData = await articleService.getPublishedArticles();
      setArticles(articlesData);
      setFilteredArticles(articlesData);
      
      // Extract tags
      const tags = articlesData.flatMap(article => article.tags || []);
      setAllTags([...new Set(tags)]);
      
      // Load trending articles
      try {
        const trendingData = await articleService.getTrendingArticles();
        setTrendingArticles(trendingData);
      } catch (error) {
        console.error("Failed to load trending articles:", error);
      } finally {
        setIsTrendingLoading(false);
      }
      
      // Load liked articles
      try {
        const likesData = await articleService.getLikedArticles();
        const likedIds = likesData.map(item => item.article);
        setLikedArticleIds(likedIds);
        
        // Find the full article objects that are liked
        const likedArticleObjects = articlesData.filter(article => 
          likedIds.includes(article.id)
        );
        setLikedArticles(likedArticleObjects);
      } catch (error) {
        console.error("Failed to load liked articles:", error);
      } finally {
        setIsLikesLoading(false);
      }
      
      // Load bookmarked articles
      try {
        const bookmarksData = await articleService.getBookmarkedArticles();
        const bookmarkedIds = bookmarksData.map(item => item.article);
        setBookmarkedArticleIds(bookmarkedIds);
        
        // Find the full article objects that are bookmarked
        const bookmarkedArticleObjects = articlesData.filter(article => 
          bookmarkedIds.includes(article.id)
        );
        setBookmarkedArticles(bookmarkedArticleObjects);
      } catch (error) {
        console.error("Failed to load bookmarked articles:", error);
      } finally {
        setIsBookmarksLoading(false);
      }
      
    } catch (error) {
      console.error("Failed to load articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter articles when search term or selected tags change
  useEffect(() => {
    let filtered = articles;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.tags && article.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(article => 
        selectedTags.every(tag => article.tags && article.tags.includes(tag))
      );
    }
    
    setFilteredArticles(filtered);
  }, [searchTerm, selectedTags, articles]);

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  const getTabContent = () => {
    switch (activeTab) {
      case "trending":
        return (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isTrendingLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))
            ) : trendingArticles.length > 0 ? (
              trendingArticles.map(article => (
                <Link to={`/articles/${article.slug}`} key={article.id} className="group">
                  <ArticleCard
                    article={article}
                    isBookmarked={bookmarkedArticleIds.includes(article.id)}
                    isLiked={likedArticleIds.includes(article.id)}
                    setBookmarkedArticles={setBookmarkedArticleIds}
                    setLikedArticles={setLikedArticleIds}
                  />
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No trending articles</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Check back later for trending content. We're constantly updating our articles!
                </p>
              </div>
            )}
          </div>
        );
        
      case "liked":
        return (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLikesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))
            ) : likedArticles.length > 0 ? (
              likedArticles.map(article => (
                <Link to={`/articles/${article.slug}`} key={article.id} className="group">
                  <ArticleCard
                    article={article}
                    isBookmarked={bookmarkedArticleIds.includes(article.id)}
                    isLiked={true}
                    setBookmarkedArticles={setBookmarkedArticleIds}
                    setLikedArticles={setLikedArticleIds}
                  />
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No liked articles</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  You haven't liked any articles yet. Browse our collection and like the ones you enjoy!
                </p>
              </div>
            )}
          </div>
        );
        
      case "bookmarked":
        return (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isBookmarksLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))
            ) : bookmarkedArticles.length > 0 ? (
              bookmarkedArticles.map(article => (
                <Link to={`/articles/${article.slug}`} key={article.id} className="group">
                  <ArticleCard
                    article={article}
                    isBookmarked={true}
                    isLiked={likedArticleIds.includes(article.id)}
                    setBookmarkedArticles={setBookmarkedArticleIds}
                    setLikedArticles={setLikedArticleIds}
                  />
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No bookmarked articles</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  You haven't bookmarked any articles yet. Bookmark articles to read them later!
                </p>
              </div>
            )}
          </div>
        );
        
      default: // "all" tab
        return (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map(article => (
                <Link to={`/articles/${article.slug}`} key={article.id} className="group">
                  <ArticleCard
                    article={article}
                    isBookmarked={bookmarkedArticleIds.includes(article.id)}
                    isLiked={likedArticleIds.includes(article.id)}
                    setBookmarkedArticles={setBookmarkedArticleIds}
                    setLikedArticles={setLikedArticleIds}
                  />
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No articles found</h3>
                <p className="text-muted-foreground mt-2 mb-4 max-w-md">
                  We couldn't find any articles matching your search criteria.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Articles</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover interesting content from our writers
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="self-end md:self-auto"
          onClick={loadData}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <div className="mb-8">
        <Card className="border-purple-100 dark:border-purple-900/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles by title, description or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" 
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2 items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium hidden sm:inline">Filters:</span>
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedTags.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters} 
                      className="h-8 text-xs gap-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tags section */}
            {allTags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium flex items-center mr-1">
                    <Tag className="h-4 w-4 mr-1" />
                    Topics:
                  </span>
                  {allTags.slice(0, 10).map((tag, index) => (
                    <Badge 
                      key={index}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer",
                        selectedTags.includes(tag) 
                          ? "bg-purple-600 hover:bg-purple-700" 
                          : "bg-transparent text-gray-700 hover:bg-purple-100 dark:text-gray-300 dark:hover:bg-purple-900/30"
                      )}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {allTags.length > 10 && (
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      +{allTags.length - 10} more
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-auto pb-2">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-background data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400"
            >
              <FileText className="mr-2 h-4 w-4" />
              All Articles
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="data-[state=active]:bg-background data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="data-[state=active]:bg-background data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400"
            >
              <Heart className="mr-2 h-4 w-4" />
              Liked
              {likedArticles.length > 0 && (
                <Badge className="ml-2 bg-purple-600 hover:bg-purple-700 text-white">
                  {likedArticles.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="bookmarked" 
              className="data-[state=active]:bg-background data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmarked
              {bookmarkedArticles.length > 0 && (
                <Badge className="ml-2 bg-purple-600 hover:bg-purple-700 text-white">
                  {bookmarkedArticles.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab} className="mt-0">
          {getTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for article card skeleton
function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full bg-muted/70 animate-pulse" />
      <CardContent className="pt-4 space-y-3">
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}