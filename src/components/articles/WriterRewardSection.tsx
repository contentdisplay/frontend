// components/articles/WriterRewardsSection.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Award, BookOpen, Heart, Bookmark, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WriterRewardsSectionProps {
  articleId: number;
  totalReads: number;
  totalLikes: number;
  totalBookmarks: number;
  earnedPoints: number;
  uncollectedReads: number;
  isOwner: boolean;
  onCollectReward: () => Promise<void>;
}

export const WriterRewardsSection: React.FC<WriterRewardsSectionProps> = ({
  articleId,
  totalReads,
  totalLikes,
  totalBookmarks,
  earnedPoints,
  uncollectedReads,
  isOwner,
  onCollectReward
}) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectError, setCollectError] = useState<string | null>(null);
  
  const handleCollectReward = async () => {
    if (isCollecting || uncollectedReads <= 0) return;
    
    try {
      setIsCollecting(true);
      setCollectError(null);
      await onCollectReward();
    } catch (error: any) {
      setCollectError(error.message || 'Failed to collect rewards');
    } finally {
      setIsCollecting(false);
    }
  };
  
  if (!isOwner) return null;
  
  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-gray-900 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl text-amber-800 dark:text-amber-300">
          <Award className="mr-2 h-5 w-5 text-amber-600 dark:text-amber-400" />
          Writer Earnings Dashboard
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Reads</span>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{totalReads}</div>
            <Progress value={Math.min(totalReads * 2, 100)} className="h-1.5 mt-2" />
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Likes</span>
              <Heart className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold">{totalLikes}</div>
            <Progress value={Math.min(totalLikes * 5, 100)} className="h-1.5 mt-2" />
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Bookmarks</span>
              <Bookmark className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold">{totalBookmarks}</div>
            <Progress value={Math.min(totalBookmarks * 10, 100)} className="h-1.5 mt-2" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Reward Points</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You earn 1 point for each reader that views your article
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <Badge variant="secondary" className="text-lg px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                ₹{earnedPoints.toFixed(2)} Earned
              </Badge>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Uncollected Rewards: {uncollectedReads} {uncollectedReads === 1 ? 'read' : 'reads'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uncollectedReads > 0 
                  ? 'You have rewards waiting to be collected!'
                  : 'No new rewards available at this time.'}
              </p>
              {collectError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{collectError}</p>
              )}
            </div>
            
            <Button 
              onClick={handleCollectReward}
              disabled={isCollecting || uncollectedReads <= 0}
              className={cn(
                "min-w-[150px]", 
                uncollectedReads > 0 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" 
                  : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              )}
            >
              {isCollecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Collecting...
                </>
              ) : uncollectedReads > 0 ? (
                <>
                  <Award className="mr-2 h-4 w-4" />
                  Collect Rewards
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  All Collected
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};