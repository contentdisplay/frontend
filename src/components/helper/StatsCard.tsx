import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserStats } from '@/services/dashboardService';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Book, Heart, Bookmark, DollarSign } from 'lucide-react';

interface StatsCardProps {
  stats: UserStats | null;
  isLoading: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Book className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Articles Read</p>
                <p className="text-2xl font-bold">{stats.total_articles_read}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Likes</p>
                <p className="text-2xl font-bold">{stats.liked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bookmark className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Bookmarks</p>
                <p className="text-2xl font-bold">{stats.bookmarked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">${stats.total_earned.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold">{stats.rank}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{stats.level}</p>
                <Progress value={(stats.xp / stats.next_level_xp) * 100} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.xp}/{stats.next_level_xp} XP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.recent_achievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Recent Achievements</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {stats.recent_achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-sm text-purple-600">+{achievement.xp_reward} XP</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {stats.upcoming_rewards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Upcoming Rewards</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {stats.upcoming_rewards.map((reward, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    {reward.icon === 'Book' && <Book className="h-6 w-6 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{reward.title}</p>
                    <Progress value={reward.progress} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-1">{reward.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {stats.weekly_goals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Weekly Goals</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {stats.weekly_goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    {goal.icon === 'FileText' && <FileText className="h-6 w-6 text-green-600" />}
                    {goal.icon === 'Heart' && <Heart className="h-6 w-6 text-green-600" />}
                    {goal.icon === 'Bookmark' && <Bookmark className="h-6 w-6 text-green-600" />}
                    {goal.icon === 'DollarSign' && <DollarSign className="h-6 w-6 text-green-600" />}
                    {goal.icon === 'Users' && <Users className="h-6 w-6 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{goal.title}</p>
                    <Progress value={(goal.current / goal.target) * 100} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {goal.current}/{goal.target}
                    </p>
                    {goal.completed && <Badge className="mt-2">Completed</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;