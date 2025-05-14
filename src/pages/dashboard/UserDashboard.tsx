
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  TrendingUp, 
  Gift, 
  BarChart2,
  Volume2,
  VolumeX,
  ChevronRight,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import dashboardService, { 
  TrendingArticle, 
  Offer, 
  TopTransaction, 
  UserStats, 
  UserActivity,
  Promotion 
} from "@/services/dashboardService";
import DashboardArticleCard from "@/components/helper/DashboardArticleCard";
import ActivityTimeline from "@/components/helper/ActivityTimeline";
import StatsCard from "@/components/helper/StatsCard";
import { useSoundEffects } from "@/components/helper/useSoundEffects";

export default function UserDashboard() {
  const { user } = useAuth();
  const { soundEnabled, toggleSound, playSound } = useSoundEffects();
  
  // State variables
  const [trendingArticles, setTrendingArticles] = useState<TrendingArticle[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [topTransactions, setTopTransactions] = useState<TopTransaction[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState({
    articles: true,
    offers: true,
    transactions: true,
    stats: true,
    activity: true,
    promotions: true,
  });

  // Track carousel interval
  const carouselIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Fetch all dashboard data on mount
  useEffect(() => {
    fetchTrendingArticles();
    fetchOffers();
    fetchTopTransactions();
    fetchUserStats();
    fetchUserActivity();
    fetchPromotions();

    // Clean up intervals on unmount
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, []);

  // Auto-rotate offers every 5 seconds
  useEffect(() => {
    if (offers.length > 0) {
      carouselIntervalRef.current = setInterval(() => {
        setCurrentOfferIndex((prevIndex) => (prevIndex + 1) % offers.length);
        if (soundEnabled) {
          playSound('slide');
        }
      }, 5000);
    }

    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, [offers, soundEnabled, playSound]);

  // Fetch trending articles
  const fetchTrendingArticles = async () => {
    try {
      const articles = await dashboardService.getTrendingArticles();
      setTrendingArticles(articles);
    } catch (error) {
      console.error('Failed to fetch trending articles:', error);
      toast.error('Failed to load trending articles');
    } finally {
      setLoading((prev) => ({ ...prev, articles: false }));
    }
  };

  // Fetch offers
  const fetchOffers = async () => {
    try {
      const data = await dashboardService.getActiveOffers();
      setOffers(data);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      toast.error('Failed to load active offers');
    } finally {
      setLoading((prev) => ({ ...prev, offers: false }));
    }
  };

  // Fetch top transactions
  const fetchTopTransactions = async () => {
    try {
      const data = await dashboardService.getTopTransactions();
      setTopTransactions(data);
    } catch (error) {
      console.error('Failed to fetch top transactions:', error);
      toast.error('Failed to load top transactions');
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }));
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const data = await dashboardService.getUserStats();
      setUserStats(data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      toast.error('Failed to load user statistics');
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  // Fetch user activity
  const fetchUserActivity = async () => {
    try {
      const data = await dashboardService.getUserActivity();
      setUserActivity(data);
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      toast.error('Failed to load user activity');
    } finally {
      setLoading((prev) => ({ ...prev, activity: false }));
    }
  };

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      const data = await dashboardService.getActivePromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading((prev) => ({ ...prev, promotions: false }));
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle earning click
  const handleEarnClick = () => {
    playSound('earn');
    toast.success('You\'ve navigated to earning opportunities!');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome Back, {user?.name}!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your account today
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSound}
          onMouseEnter={() => playSound('hover')}
          className="transition-all hover:scale-105"
        >
          {soundEnabled ? (
            <Volume2 className="h-5 w-5 text-green-500" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Top and Trending Articles Carousel */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
              Trending Articles
            </CardTitle>
            <Link to="/articles">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-purple-600"
                onMouseEnter={() => playSound('hover')}
                onClick={() => playSound('click')}
              >
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <CardDescription>
            Discover popular content and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          {loading.articles ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <Carousel 
              className="w-full"
              onMouseEnter={() => playSound('hover')}
            >
              <CarouselContent>
                {trendingArticles.map((article, index) => (
                  <CarouselItem key={article.id} className="md:basis-1/2 lg:basis-1/3">
                    <DashboardArticleCard 
                      article={article}
                      index={index}
                      onMouseEnter={() => playSound('hover')}
                      onEarnClick={() => playSound('earn')}
                      IconComponent={Zap}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-center mt-4">
                <CarouselPrevious 
                  className="static translate-y-0 mx-2" 
                  onClick={() => playSound('click')}
                />
                <div className="flex gap-1">
                  {trendingArticles.slice(0, 5).map((_, index) => (
                    <div 
                      key={index} 
                      className={`h-1.5 rounded-full ${
                        index === currentOfferIndex % trendingArticles.length 
                          ? 'w-6 bg-purple-500' 
                          : 'w-1.5 bg-purple-200'
                      } transition-all`}
                    />
                  ))}
                </div>
                <CarouselNext 
                  className="static translate-y-0 mx-2"
                  onClick={() => playSound('click')}
                />
              </div>
            </Carousel>
          )}
        </CardContent>
      </Card>

      {/* Offers Carousel */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center">
            <Gift className="mr-2 h-5 w-5 text-blue-600" />
            Special Offers
          </CardTitle>
          <CardDescription>
            Limited-time opportunities to maximize your rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          {loading.offers ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : offers.length > 0 ? (
            <div className="relative overflow-hidden rounded-lg">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentOfferIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-[21/9] w-full"
                >
                  <img 
                    src={offers[currentOfferIndex].image} 
                    alt={offers[currentOfferIndex].title} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-lg"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold">{offers[currentOfferIndex].title}</h3>
                    <p className="mt-2 text-white/80">{offers[currentOfferIndex].description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <Badge className="bg-blue-600 hover:bg-blue-700">
                          Reward: ${offers[currentOfferIndex].reward_amount}
                        </Badge>
                        {offers[currentOfferIndex].code && (
                          <Badge className="ml-2 bg-white text-blue-900">
                            Code: {offers[currentOfferIndex].code}
                          </Badge>
                        )}
                      </div>
                      <Link to={offers[currentOfferIndex].link}>
                        <Button 
                          className="bg-white text-blue-600 hover:bg-blue-50"
                          onMouseEnter={() => playSound('hover')}
                          onClick={() => playSound('earn')}
                        >
                          Claim Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                {offers.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentOfferIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                    }`}
                    onClick={() => {
                      setCurrentOfferIndex(index);
                      playSound('click');
                    }}
                  />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear", repeat: Infinity }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="mx-auto h-12 w-12 text-blue-300 mb-3" />
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">No active offers</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Check back soon for new opportunities!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two column layout for Transactions and Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Transactions */}
        <Card className="overflow-hidden border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Top Earners
            </CardTitle>
            <CardDescription>
              Users who earned the most rewards recently
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading.transactions ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                      <div className="h-2 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-14 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : topTransactions.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-auto pr-2">
                {topTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                    onMouseEnter={() => playSound('hover')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={transaction.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${transaction.user.username}`}
                          alt={transaction.user.username}
                          className="h-10 w-10 rounded-full object-cover border-2 border-white shadow"
                        />
                        {index < 3 && (
                          <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.user.username}</p>
                        <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="font-bold text-green-600">
                      +{formatCurrency(transaction.amount)}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No transactions yet</h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to earn rewards!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Analytics */}
        <Card className="overflow-hidden border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-indigo-600" />
              Your Analytics
            </CardTitle>
            <CardDescription>
              Personal statistics and activity metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatsCard stats={userStats} isLoading={loading.stats} />
          </CardContent>
        </Card>
      </div>

      {/* Promotions Section */}
      {promotions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center">
            <Gift className="mr-2 h-5 w-5 text-purple-600" />
            Featured Promotions
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {loading.promotions ? (
              Array(2).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-lg"></div>
                </div>
              ))
            ) : (
              promotions.slice(0, 2).map((promotion, index) => (
                <motion.div
                  key={promotion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  onMouseEnter={() => playSound('hover')}
                >
                  <img 
                    src={promotion.image} 
                    alt={promotion.title} 
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h4 className="font-bold text-lg">{promotion.title}</h4>
                    <p className="text-sm text-white/80 line-clamp-2">{promotion.description}</p>
                    <Button 
                      className="mt-2 bg-white text-purple-600 hover:bg-purple-50"
                      size="sm"
                      onMouseEnter={() => playSound('hover')}
                      onClick={() => {
                        playSound('earn');
                        window.open(promotion.link, '_blank');
                      }}
                    >
                      Learn More
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* User Activity Feed */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center">
            <FileText className="mr-2 h-5 w-5 text-slate-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your recent interactions and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger 
                value="all" 
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="earnings" 
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
              >
                Earnings
              </TabsTrigger>
              <TabsTrigger 
                value="reads" 
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
              >
                Reads
              </TabsTrigger>
              <TabsTrigger 
                value="likes" 
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
              >
                Likes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <ActivityTimeline events={userActivity?.all || []} isLoading={loading.activity} />
            </TabsContent>
            <TabsContent value="earnings" className="mt-4">
              <ActivityTimeline events={userActivity?.earnings || []} isLoading={loading.activity} type="earnings" />
            </TabsContent>
            <TabsContent value="reads" className="mt-4">
              <ActivityTimeline events={userActivity?.reads || []} isLoading={loading.activity} type="reads" />
            </TabsContent>
            <TabsContent value="likes" className="mt-4">
              <ActivityTimeline events={userActivity?.likes || []} isLoading={loading.activity} type="likes" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
