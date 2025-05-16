// components/articles/ArticleStats.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Heart, Bookmark, Award, TrendingUp } from 'lucide-react';

interface ArticleStatsProps {
  reads: number;
  likes: number;
  bookmarks: number;
  rewards: number;
  earnings: number;
}

export function ArticleStats({
  reads,
  likes,
  bookmarks,
  rewards,
  earnings
}: ArticleStatsProps) {
  return (
    <Card className="border-indigo-100 dark:border-indigo-900/30">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Article Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{reads}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Reads</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Heart className="h-6 w-6 text-rose-500 mb-2" />
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{likes}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Likes</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Bookmark className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{bookmarks}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Bookmarks</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Award className="h-6 w-6 text-amber-500 mb-2" />
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{rewards}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Rewards</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="font-medium text-emerald-600 dark:text-emerald-400 mb-2">₹</div>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{earnings.toFixed(2)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Earnings</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}