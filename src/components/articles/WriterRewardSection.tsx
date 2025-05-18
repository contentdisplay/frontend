// components/articles/WriterRewardSection.tsx
import React from 'react';
import { Award, ThumbsUp, Bookmark, Users, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WriterRewardsSectionProps {
  articleId: number;
  totalReads: number;
  totalLikes: number;
  totalBookmarks: number;
  earnedPoints: number;
  uncollectedReads: number;
  isOwner: boolean;
  onCollectReward: () => void;
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
  return (
    <Card className="mt-8 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-center">Article Performance & Rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-700">Total Reads</p>
            <p className="text-2xl font-bold text-blue-800">{totalReads}</p>
          </div>
          
          <div className="bg-pink-50 rounded-lg p-4 text-center">
            <ThumbsUp className="h-6 w-6 text-pink-600 mx-auto mb-2" />
            <p className="text-sm text-pink-700">Total Likes</p>
            <p className="text-2xl font-bold text-pink-800">{totalLikes}</p>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <Bookmark className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm text-indigo-700">Bookmarks</p>
            <p className="text-2xl font-bold text-indigo-800">{totalBookmarks}</p>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <Award className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-amber-700">Points Earned</p>
            <p className="text-2xl font-bold text-amber-800">{earnedPoints}</p>
          </div>
        </div>
        
        {isOwner && (
          <div className="mt-4">
            {uncollectedReads > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Gift className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-800">
                    You have {uncollectedReads} reward points to collect!
                  </h3>
                </div>
                <p className="text-green-700 mb-4">
                  These points include both reader engagement and gifts from readers who enjoyed your article.
                </p>
                <Button 
                  onClick={onCollectReward}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Collect Rewards
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-600 italic">
                You have collected all available rewards for this article. New rewards will appear as more readers engage with your content.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};