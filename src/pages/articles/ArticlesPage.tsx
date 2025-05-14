import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Tag, FileText, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import articleService, { Article } from '@/services/articleService';
import ArticleCard from '@/components/articles/ArticleCard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function ArticlesPage() {
  const { user } = useAuth();
  const isContentWriter = user?.roles?.includes('writer');
  const [articles, setArticles] = useState<Article[]>([]);
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMyArticlesLoading, setIsMyArticlesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setIsMyArticlesLoading(true);

    try {
      // Load published articles
      const articlesData = await articleService.getPublishedArticles();
      
      if (!Array.isArray(articlesData)) {
        console.error('Articles data is not an array:', articlesData);
        toast.error('Failed to load articles: Invalid data format');
        setArticles([]);
        setFilteredArticles([]);
        setAllTags([]);
      } else {
        setArticles(articlesData);
        setFilteredArticles(articlesData);

        // Extract tags
        const tags = articlesData.flatMap((article) => (article.tags || []));
        setAllTags([...new Set(tags)]);
      }

      // Load my articles (for content writers)
      if (isContentWriter) {
        try {
          const myArticlesData = await articleService.getPublishedArticles();
          if (Array.isArray(myArticlesData)) {
            setMyArticles(
              myArticlesData.filter((article) => article.author === user?.username)
            );
          } else {
            console.error('My articles data is not an array:', myArticlesData);
            toast.error('Failed to load my articles');
            setMyArticles([]);
          }
        } catch (error: any) {
          console.error('Failed to load my articles:', error);
          toast.error('Failed to load my articles');
          setMyArticles([]);
        } finally {
          setIsMyArticlesLoading(false);
        }
      } else {
        setIsMyArticlesLoading(false);
      }
    } catch (error: any) {
      console.error('Failed to load articles:', error);
      toast.error('Failed to load articles');
      setArticles([]);
      setFilteredArticles([]);
      setAllTags([]);
    } finally {
      setIsLoading(false);
    }
  }, [isContentWriter, user?.username]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (article.tags &&
            article.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(
        (article) =>
          article.tags &&
          selectedTags.every((tag) => article.tags.includes(tag))
      );
    }

    setFilteredArticles(filtered);
  }, [searchTerm, selectedTags, articles]);

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const handleRequestPublish = (slug: string) => {
    setMyArticles((prev) =>
      prev.map((article) =>
        article.slug === slug ? { ...article, is_pending_publish: true } : article
      )
    );
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'my-articles':
        return (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isMyArticlesLoading ? (
              Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)
            ) : myArticles.length > 0 ? (
              myArticles.map((article) => (
                <Link to={`/articles/${article.slug}`} key={article.id} className="group">
                  <ArticleCard
                    article={article}
                    isBookmarked={false} // No bookmark functionality
                    isLiked={false} // No like functionality
                    setBookmarkedArticles={() => {}} // Empty function
                    setLikedArticles={() => {}} // Empty function
                    onRequestPublish={handleRequestPublish}
                  />
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No articles yet</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Start writing your first article to share with the community!
                </p>
                <Button asChild className="mt-4">
                  <Link to="/writer/articles/create">Write an Article</Link>
                </Button>
              </div>
            )}
          </div>
        );
      default: // 'all' tab
        return (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <Link to={`/articles/${article.slug}`} key={article.id} className="group">
                  <ArticleCard
                    article={article}
                    isBookmarked={false} // No bookmark functionality
                    isLiked={false} // No like functionality
                    setBookmarkedArticles={() => {}} // Empty function
                    setLikedArticles={() => {}} // Empty function
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Articles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover interesting content from our writers
          </p>
        </div>
        <div className="flex gap-4">
          {isContentWriter && (
            <Button asChild>
              <Link to="/writer/articles/create">Write an Article</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <Card className="border-indigo-100 dark:border-indigo-900/30">
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
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer',
                        selectedTags.includes(tag)
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'bg-transparent text-gray-700 hover:bg-indigo-100 dark:text-gray-300 dark:hover:bg-indigo-900/30'
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
              className="data-[state=active]:bg-background data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
            >
              <FileText className="mr-2 h-4 w-4" />
              All Articles
            </TabsTrigger>
            {isContentWriter && (
              <TabsTrigger
                value="my-articles"
                className="data-[state=active]:bg-background data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
              >
                <FileText className="mr-2 h-4 w-4" />
                My Articles
                {myArticles.length > 0 && (
                  <Badge className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    {myArticles.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {getTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

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