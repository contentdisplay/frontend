import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityEvent } from '@/services/dashboardService';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, FileText, Heart } from 'lucide-react';

interface ActivityTimelineProps {
  events: ActivityEvent[];
  isLoading: boolean;
  type?: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events, isLoading, type }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, index) => (
          <div key={index} className="flex items-center gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No {type || 'activity'} to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-4"
        >
          <div className="flex-shrink-0">
            {event.type === 'earn' && (
              <DollarSign className="h-10 w-10 p-2 rounded-full bg-green-100 text-green-600" />
            )}
            {event.type === 'read' && (
              <FileText className="h-10 w-10 p-2 rounded-full bg-blue-100 text-blue-600" />
            )}
            {event.type === 'like' && (
              <Heart className="h-10 w-10 p-2 rounded-full bg-red-100 text-red-600" />
            )}
          </div>
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  {event.articleSlug && (
                    <Link to={`/articles/${event.articleSlug}`} className="text-sm text-blue-600 hover:underline">
                      View Article
                    </Link>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(event.time).toLocaleString()}
                  {event.amount && (
                    <p className="text-green-600 font-bold">+${event.amount.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityTimeline;