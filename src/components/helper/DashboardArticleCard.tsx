import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingArticle } from '@/services/dashboardService';
import { LucideIcon } from 'lucide-react';

interface DashboardArticleCardProps {
  article: TrendingArticle;
  index: number;
  onMouseEnter: () => void;
  onEarnClick: () => void;
  IconComponent: LucideIcon;
}

const DashboardArticleCard: React.FC<DashboardArticleCardProps> = ({
  article,
  index,
  onMouseEnter,
  onEarnClick,
  IconComponent,
}) => {
  return (
    <Card
      className="h-full transition-all hover:shadow-lg"
      onMouseEnter={onMouseEnter}
    >
      <CardHeader className="p-4">
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full h-40 object-cover rounded-md"
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold line-clamp-2">{article.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{article.description}</p>
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <span>{article.read_time} min read</span>
          <span>•</span>
          <span>{article.likes_count} likes</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src={article.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author.username}`}
            alt={article.author.username}
            className="h-6 w-6 rounded-full"
          />
          <span className="text-sm">{article.author.username}</span>
        </div>
        <Link to={`/articles/${article.slug}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={onEarnClick}
          >
            <IconComponent className="h-4 w-4 mr-2" />
            Read & Earn
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DashboardArticleCard;