// components/articles/ArticleRewardSection.tsx
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Wallet, Award } from 'lucide-react';

interface ArticleRewardSectionProps {
  articleTitle: string;
  rewardAmount: number;
  readingProgress: number;
  isReadingComplete: boolean;
  isRewardClaimed: boolean;
  isClaimingReward: boolean;
  onClaimReward: () => void;
  multiplier?: number;
}

export function ArticleRewardSection({
  articleTitle,
  rewardAmount,
  readingProgress,
  isReadingComplete,
  isRewardClaimed,
  isClaimingReward,
  onClaimReward,
  multiplier = 1.0
}: ArticleRewardSectionProps) {
  return (
    <Card className="bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-2 w-full">
            <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
              <Award className="h-4 w-4" /> Reading Progress
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400">
              {isReadingComplete
                ? "Congratulations! You've completed this article!"
                : `${Math.min(100, Math.round(readingProgress))}% complete`}
            </div>
            <Progress
              value={readingProgress}
              className="h-2 bg-indigo-200 dark:bg-indigo-800"
              indicatorClassName="bg-gradient-to-r from-amber-400 to-orange-500"
            />
          </div>
          <div className="text-center md:text-right">
            <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
              {isRewardClaimed ? "Reward Claimed" : "Available Reward"}
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{(rewardAmount * multiplier).toFixed(2)}
              {multiplier > 1 && (
                <span className="text-xs ml-1 text-amber-500">({multiplier}x bonus)</span>
              )}
            </div>
            <Button
              variant={isReadingComplete ? 'default' : 'outline'}
              size="sm"
              onClick={onClaimReward}
              disabled={!isReadingComplete || isRewardClaimed || isClaimingReward}
              className={
                isReadingComplete && !isRewardClaimed
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white animate-pulse mt-2'
                  : 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 mt-2'
              }
            >
              {isClaimingReward ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : isRewardClaimed ? (
                <>
                  <Wallet className="mr-1 h-4 w-4" />
                  <span>Reward Claimed</span>
                </>
              ) : (
                <>
                  <Wallet className="mr-1 h-4 w-4" />
                  <span>
                    {isReadingComplete
                      ? `Claim Reward`
                      : `Read to earn reward`}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}