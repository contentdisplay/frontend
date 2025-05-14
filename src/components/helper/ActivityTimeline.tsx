import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActivityEvent } from '@/services/dashboardService';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, DollarSign, Book, Heart, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityTimelineProps {
  events: ActivityEvent[];
  isLoading: boolean;
  type?: 'all' | 'earnings' | 'reads' | 'likes';
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events, isLoading, type = 'all' }) => {
  // Format time to relative format
  const formatTime = (timeString: string) => {
    try {
      return formatDistanceToNow(new Date(timeString), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  // Get icon based on event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'earn':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'read':
        return <Book className="h-5 w-5 text-blue-500" />;
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'bookmark':
        return <Bookmark className="h-5 w-5 text-purple-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200 mt-1"></div>
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    let message = 'No activity to display yet';
    
    switch (type) {
      case 'earnings':
        message = 'No earnings activity yet';
        break;
      case 'reads':
        message = 'No reading activity yet';
        break;
      case 'likes':
        message = 'No likes activity yet';
        break;
    }
    
    return (
      <Card className="p-6 text-center bg-gray-50 dark:bg-gray-800/50">
        <p className="text-muted-foreground">{message}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/articles">
            Explore Articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-h-60 overflow-auto pr-2">
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mt-1">
            {getEventIcon(event.type)}
          </div>
          <div className="flex-1">
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTime(event.time)}
            {event.amount !== undefined && (
              <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                +${event.amount.toFixed(2)}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;