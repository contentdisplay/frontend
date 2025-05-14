import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Bookmark, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingArticle } from '@/services/dashboardService';

interface DashboardArticleCardProps {
  article: TrendingArticle;
  index: number;
  onMouseEnter?: () => void;
  onEarnClick?: () => void;
  IconComponent?: React.ComponentType<any>;
}

const DashboardArticleCard: React.FC<DashboardArticleCardProps> = ({ 
  article, 
  index, 
  onMouseEnter,
  onEarnClick,
  IconComponent = DollarSign
}) => {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate read time (rough estimate)
  const getReadTime = () => {
    const wordsPerMinute = 200;
    const wordCount = (article.content?.split(/\s+/)?.length || 0) + 
                      (article.description?.split(/\s+/)?.length || 0);
    const readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    return `${readTime} min read`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={onMouseEnter}
    >
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow relative">
        {article.reward > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              ${article.reward.toFixed(2)} Reward
            </Badge>
          </div>
        )}
        
        <Link to={`/articles/${article.slug}`}>
          <div className="aspect-video w-full overflow-hidden border-b">
            {article.thumbnail ? (
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <IconComponent className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
        </Link>
        
        <CardContent className="p-4">
          <Link to={`/articles/${article.slug}`}>
            <h3 className="font-semibold line-clamp-2 hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
          </Link>
          
          <p className="text-muted-foreground text-sm mt-1.5 line-clamp-2">
            {article.description}
          </p>
        </CardContent>
        
        <CardFooter className="px-4 py-3 border-t flex justify-between items-center bg-muted/10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{getReadTime()}</span>
            </div>
            <span>•</span>
            <span>{formatDate(article.published_at || article.created_at)}</span>
          </div>
          
          <Link to={`/articles/${article.slug}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-blue-600"
              onClick={onEarnClick}
            >
              Read & Earn
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DashboardArticleCard;