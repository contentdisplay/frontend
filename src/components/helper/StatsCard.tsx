import React from 'react';
import { Progress } from "@/components/ui/progress";
import { UserStats } from '@/services/dashboardService';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, Clock, Heart, Bookmark, Award, BarChart2, Target } from 'lucide-react';

interface StatsCardProps {
  stats: UserStats | null;
  isLoading: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <BarChart2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <p>No stats available</p>
        <Button className="mt-4" variant="outline">Refresh Stats</Button>
      </div>
    );
  }

  // Safely access properties to avoid "undefined" errors
  const totalEarned = stats.total_earned !== undefined ? stats.total_earned : 0;
  const minutesRead = stats.minutes_read || 0;
  const totalArticlesRead = stats.total_articles_read || 0;
  const level = stats.level || 1;
  const rank = stats.rank || "Beginner";
  const xp = stats.xp || 0;
  const nextLevelXp = stats.next_level_xp || 100;
  const achievements = stats.recent_achievements || [];
  const weeklyGoals = stats.weekly_goals || [];

  return (
    <div className="space-y-4">
      {/* Level and XP Progress */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <div>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
              Level {level}
            </Badge>
            <Badge className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
              {rank}
            </Badge>
          </div>
          <span className="text-sm font-medium">{xp}/{nextLevelXp} XP</span>
        </div>
        <Progress value={(Number(xp) / Number(nextLevelXp)) * 100} className="h-2" />
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg text-center">
          <div className="flex justify-center mb-1">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-xl font-bold">{minutesRead}</div>
          <div className="text-xs text-muted-foreground">Minutes Read</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-center">
          <div className="flex justify-center mb-1">
            <Book className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-xl font-bold">{totalArticlesRead}</div>
          <div className="text-xs text-muted-foreground">Articles Read</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg text-center">
          <div className="flex justify-center mb-1">
            <Award className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-xl font-bold">${typeof totalEarned === 'number' ? totalEarned.toFixed(2) : '0.00'}</div>
          <div className="text-xs text-muted-foreground">Total Earned</div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Award className="h-4 w-4 mr-1 text-amber-500" />
            Recent Achievements
          </h4>
          <div className="space-y-2">
            {achievements.slice(0, 2).map((achievement) => (
              <div key={achievement.id} className="bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg flex items-center">
                <div className="bg-amber-100 dark:bg-amber-900/30 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                  <Award className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                  +{achievement.xp} XP
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Goals */}
      {weeklyGoals.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Target className="h-4 w-4 mr-1 text-indigo-500" />
            Weekly Goals
          </h4>
          <div className="space-y-2">
            {weeklyGoals.slice(0, 2).map((goal, index) => (
              <div key={index} className="bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{goal.title}</span>
                  <span className="text-xs font-medium">{goal.current}/{goal.target}</span>
                </div>
                <Progress value={(goal.current / goal.target) * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;