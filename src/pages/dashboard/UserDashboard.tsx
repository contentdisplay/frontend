import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Zap,
  Award,
  Users,
  DollarSign,
  Calendar,
  Link as LinkIcon,
  Bookmark,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import dashboardService from "@/services/dashboardService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function UserDashboard() {
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [offers, setOffers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [topEarners, setTopEarners] = useState([]);
  const [topTransactions, setTopTransactions] = useState([]);
  const [claimingOffer, setClaimingOffer] = useState(null);
  const [loading, setLoading] = useState({
    offers: true,
    promotions: true,
    earners: true,
    transactions: true,
  });
  const [activeTab, setActiveTab] = useState("offers");

  // Placeholder for sound effects
  const playSound = (type) => {
    // Sound effect implementation would go here
    console.log(`Playing sound: ${type}`);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Fetch all dashboard data on mount
  useEffect(() => {
    fetchOffers();
    fetchPromotions();
    fetchTopEarners();
    fetchTopTransactions();
  }, []);

  // Fetch offers
  const fetchOffers = async () => {
    try {
      const data = await dashboardService.getActiveOffers();
      // Handle the API response format which includes a results array
      setOffers(data.results || data);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
      toast.error("Failed to load active offers");
    } finally {
      setLoading((prev) => ({ ...prev, offers: false }));
    }
  };

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      const data = await dashboardService.getActivePromotions();
      // Handle the API response format which includes a results array
      setPromotions(data.results || data);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
      toast.error("Failed to load promotions");
    } finally {
      setLoading((prev) => ({ ...prev, promotions: false }));
    }
  };

  // Fetch top earners
  const fetchTopEarners = async () => {
    try {
      const data = await dashboardService.getTopRewardEarners();
      // Handle the API response format which includes a results array
      setTopEarners(data.results || data);
    } catch (error) {
      console.error("Failed to fetch top earners:", error);
      toast.error("Failed to load top earners");
    } finally {
      setLoading((prev) => ({ ...prev, earners: false }));
    }
  };

  // Fetch top transactions
  const fetchTopTransactions = async () => {
    try {
      const data = await dashboardService.getTopTransactions();
      // Handle the API response format which includes a results array
      setTopTransactions(data.results || data);
    } catch (error) {
      console.error("Failed to fetch top transactions:", error);
      toast.error("Failed to load top transactions");
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }));
    }
  };

  // Handle claim offer
  const handleClaimOffer = async (offer) => {
    setClaimingOffer(offer.id);
    try {
      const response = await dashboardService.claimOffer(offer.id);
      
      // Show success message
      toast.success(response.message, {
        description: `You earned ${response.reward_amount} points!`,
        duration: 5000,
      });

      // Play success sound
      playSound("earn");

      // Refresh offers to get updated claim status
      await fetchOffers();

    } catch (error) {
      console.error("Failed to claim offer:", error);
      toast.error(error.message || "Failed to claim offer");
    } finally {
      setClaimingOffer(null);
    }
  };

  // Check if user can claim offers (no offer claimed today)
  const canClaimOffers = () => {
    return !offers.some(offer => offer.is_claimed_today);
  };

  // Get the offer that was claimed today (if any)
  const getClaimedOfferToday = () => {
    const claimedOffer = offers.find(offer => offer.is_claimed_today);
    return claimedOffer?.claimed_offer_today || null;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get badge color based on rank
  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-yellow-950";
      case 2:
        return "bg-gray-400 text-gray-950";
      case 3:
        return "bg-amber-700 text-amber-50";
      default:
        return "bg-blue-600 text-white";
    }
  };

  // Prepare data for charts
  const prepareTransactionData = () => {
    return topTransactions.map((transaction) => ({
      name: transaction.username,
      earned: parseFloat(transaction.amount_earned),
      spent: parseFloat(transaction.amount_spent),
      withdrawn: parseFloat(transaction.amount_withdrawn),
    }));
  };

  const prepareEarnerDistributionData = () => {
    return topEarners.map((earner) => ({
      name: earner.username,
      value: parseFloat(earner.total_rewards),
    }));
  };

  // Generate colors for pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome Back, {user?.name || "User"}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your account today
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSound}
          onMouseEnter={() => playSound("hover")}
          className="transition-all hover:scale-105"
        >
          {soundEnabled ? (
            <Volume2 className="h-5 w-5 text-green-500" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Daily Claim Status Banner */}
      {!canClaimOffers() && (
        <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Daily Reward Claimed!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You've already claimed your daily reward from "{getClaimedOfferToday()?.title}". 
                  Come back tomorrow for more rewards!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs Section - Working Responsive Version */}
      <Tabs
        defaultValue="offers"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        {/* Desktop Tab Navigation */}
        <TabsList className="hidden md:grid w-full grid-cols-4 h-12">
          <TabsTrigger
            value="offers"
            onClick={() => playSound("click")}
            className="flex items-center space-x-2"
          >
            <Gift className="h-4 w-4" />
            <span>Offers</span>
          </TabsTrigger>
          <TabsTrigger
            value="promotions"
            onClick={() => playSound("click")}
            className="flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Promotions</span>
          </TabsTrigger>
          <TabsTrigger
            value="earners"
            onClick={() => playSound("click")}
            className="flex items-center space-x-2"
          >
            <Award className="h-4 w-4" />
            <span>Top Earners</span>
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            onClick={() => playSound("click")}
            className="flex items-center space-x-2"
          >
            <DollarSign className="h-4 w-4" />
            <span>Transactions</span>
          </TabsTrigger>
        </TabsList>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden grid grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <button
            onClick={() => {
              setActiveTab("offers");
              playSound("click");
            }}
            className={`flex flex-col items-center justify-center p-3 h-16 rounded-lg transition-all ${
              activeTab === "offers"
                ? "bg-white shadow-md text-blue-600 border-2 border-blue-200 dark:bg-gray-800 dark:border-blue-400"
                : "bg-transparent hover:bg-white/50 dark:hover:bg-gray-800/50"
            }`}
          >
            <Gift className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Offers</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("promotions");
              playSound("click");
            }}
            className={`flex flex-col items-center justify-center p-3 h-16 rounded-lg transition-all ${
              activeTab === "promotions"
                ? "bg-white shadow-md text-purple-600 border-2 border-purple-200 dark:bg-gray-800 dark:border-purple-400"
                : "bg-transparent hover:bg-white/50 dark:hover:bg-gray-800/50"
            }`}
          >
            <Zap className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Promotions</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("earners");
              playSound("click");
            }}
            className={`flex flex-col items-center justify-center p-3 h-16 rounded-lg transition-all ${
              activeTab === "earners"
                ? "bg-white shadow-md text-amber-600 border-2 border-amber-200 dark:bg-gray-800 dark:border-amber-400"
                : "bg-transparent hover:bg-white/50 dark:hover:bg-gray-800/50"
            }`}
          >
            <Award className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Top Earners</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("transactions");
              playSound("click");
            }}
            className={`flex flex-col items-center justify-center p-3 h-16 rounded-lg transition-all ${
              activeTab === "transactions"
                ? "bg-white shadow-md text-green-600 border-2 border-green-200 dark:bg-gray-800 dark:border-green-400"
                : "bg-transparent hover:bg-white/50 dark:hover:bg-gray-800/50"
            }`}
          >
            <DollarSign className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Transactions</span>
          </button>
        </div>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-4">
          <Card className="border shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
              <CardTitle className="flex items-center text-xl">
                <Gift className="mr-2 h-5 w-5 text-blue-600" />
                Special Offers
              </CardTitle>
              <CardDescription>
                Limited-time opportunities to maximize your rewards {!canClaimOffers() && "(Daily limit reached)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading.offers ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : offers.length > 0 ? (
                <>
                  {/* Desktop Table View - Hidden on mobile */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-blue-50 dark:bg-blue-900/20">
                        <TableRow>
                          <TableHead className="w-[200px]">Title</TableHead>
                          <TableHead className="w-[300px]">
                            Description
                          </TableHead>
                          <TableHead className="text-center">Image</TableHead>
                          <TableHead className="text-center">Reward</TableHead>
                          <TableHead className="text-center">
                            Redemption
                          </TableHead>
                          <TableHead className="text-center">Code</TableHead>
                          <TableHead className="text-center">Expires</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offers.map((offer, index) => (
                          <motion.tr
                            key={offer.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                            onMouseEnter={() => playSound("hover")}
                          >
                            <TableCell className="font-medium">
                              {offer.title}
                            </TableCell>
                            <TableCell>
                              <p
                                className="max-w-[300px] truncate"
                                title={offer.description}
                              >
                                {offer.description}
                              </p>
                            </TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-blue-500"
                                      onClick={() =>
                                        window.open(offer.image, "_blank")
                                      }
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Image</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-center font-bold text-green-600">
                              {formatCurrency(offer.reward_amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-blue-500"
                                      onClick={() =>
                                        window.open(
                                          offer.redemption_link,
                                          "_blank"
                                        )
                                      }
                                    >
                                      <LinkIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Open Link</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-center">
                              {offer.redemption_code ? (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                  {offer.redemption_code}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="border-red-200 text-red-600"
                              >
                                {formatDate(offer.expires_at)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex space-x-2 justify-center">
                                <Button
                                  className={`${
                                    canClaimOffers()
                                      ? "bg-green-600 hover:bg-green-700"
                                      : "bg-gray-400 cursor-not-allowed"
                                  }`}
                                  size="sm"
                                  disabled={!canClaimOffers() || claimingOffer === offer.id}
                                  onClick={() => handleClaimOffer(offer)}
                                >
                                  {claimingOffer === offer.id ? (
                                    <div className="flex items-center space-x-2">
                                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                                      <span>Claiming...</span>
                                    </div>
                                  ) : canClaimOffers() ? (
                                    <>
                                      <Gift className="h-3 w-3 mr-1" />
                                      Claim Reward
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Claimed Today
                                    </>
                                  )}
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    playSound("click");
                                    window.open(offer.redemption_link, "_blank");
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View - Visible only on mobile */}
                  <div className="md:hidden space-y-4 p-4">
                    {offers.map((offer, index) => (
                      <motion.div
                        key={offer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4 space-y-3 ${
                          !canClaimOffers()
                            ? "border-gray-300 opacity-75"
                            : "border-blue-200"
                        }`}
                        onTouchStart={() => playSound("hover")}
                      >
                        {/* Header with Title and Reward */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight">
                              {offer.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {offer.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end ml-3">
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(offer.reward_amount)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Reward
                            </span>
                          </div>
                        </div>

                        {/* Claim Status Indicator */}
                        {!canClaimOffers() && (
                          <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 dark:text-green-300">
                              Daily reward already claimed
                            </span>
                          </div>
                        )}

                        {/* Expiry Date */}
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Expires: {formatDate(offer.expires_at)}
                          </span>
                        </div>

                        {/* Redemption Code (if available) */}
                        {offer.redemption_code && (
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                              Code: {offer.redemption_code}
                            </Badge>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button
                            className={`flex-1 h-10 ${
                              canClaimOffers()
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!canClaimOffers() || claimingOffer === offer.id}
                            onClick={() => handleClaimOffer(offer)}
                          >
                            {claimingOffer === offer.id ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                <span>Claiming...</span>
                              </div>
                            ) : canClaimOffers() ? (
                              <>
                                <Gift className="h-4 w-4 mr-2" />
                                Claim Reward
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Claimed Today
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-blue-200"
                            onClick={() => window.open(offer.image, "_blank")}
                          >
                            <FileText className="h-4 w-4 text-blue-500" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-blue-200"
                            onClick={() => window.open(offer.redemption_link, "_blank")}
                          >
                            <LinkIcon className="h-4 w-4 text-blue-500" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Gift className="mx-auto h-12 w-12 text-blue-300 mb-3" />
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                    No active offers
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Check back soon for new opportunities!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <Card className="border shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
              <CardTitle className="flex items-center text-xl">
                <Zap className="mr-2 h-5 w-5 text-purple-600" />
                Active Promotions
              </CardTitle>
              <CardDescription>
                Current promotional campaigns and special events
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading.promotions ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : promotions.length > 0 ? (
                <>
                  {/* Desktop Table View - Hidden on mobile */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-purple-50 dark:bg-purple-900/20">
                        <TableRow>
                          <TableHead className="w-[200px]">Title</TableHead>
                          <TableHead className="w-[300px]">
                            Description
                          </TableHead>
                          <TableHead className="text-center">Image</TableHead>
                          <TableHead className="text-center">Link</TableHead>
                          <TableHead className="text-center">
                            Start Date
                          </TableHead>
                          <TableHead className="text-center">
                            End Date
                          </TableHead>
                          <TableHead className="text-center">
                            Priority
                          </TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promotions.map((promotion, index) => (
                          <motion.tr
                            key={promotion.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`hover:bg-purple-50/50 dark:hover:bg-purple-900/10 ${
                              !promotion.is_active
                                ? "opacity-60 bg-gray-100 dark:bg-gray-800"
                                : ""
                            }`}
                            onMouseEnter={() => playSound("hover")}
                          >
                            <TableCell className="font-medium">
                              {promotion.title}
                            </TableCell>
                            <TableCell>
                              <p
                                className="max-w-[300px] truncate"
                                title={promotion.description}
                              >
                                {promotion.description}
                              </p>
                            </TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-purple-500"
                                      onClick={() =>
                                        window.open(promotion.image, "_blank")
                                      }
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Image</TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-purple-500"
                                      onClick={() =>
                                        window.open(promotion.link, "_blank")
                                      }
                                    >
                                      <LinkIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Open Link</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="border-green-200 text-green-600"
                              >
                                {formatDate(promotion.start_date)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="border-red-200 text-red-600"
                              >
                                {formatDate(promotion.end_date)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {promotion.priority > 0 ? (
                                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                                  {promotion.priority}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                size="sm"
                                disabled={!promotion.is_active}
                                onClick={() => {
                                  playSound("earn");
                                  window.open(promotion.link, "_blank");
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View - Visible only on mobile */}
                  <div className="md:hidden space-y-4 p-4">
                    {promotions.map((promotion, index) => (
                      <motion.div
                        key={promotion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4 space-y-3 ${
                          !promotion.is_active
                            ? "border-gray-300 opacity-60 bg-gray-50 dark:bg-gray-900"
                            : "border-purple-200"
                        }`}
                        onTouchStart={() => playSound("hover")}
                      >
                        {/* Header with Title and Status */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight">
                                {promotion.title}
                              </h3>
                              {!promotion.is_active && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {promotion.description}
                            </p>
                          </div>
                          {promotion.priority > 0 && (
                            <div className="flex flex-col items-end ml-3">
                              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                                Priority {promotion.priority}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-green-500" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Starts: {formatDate(promotion.start_date)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-red-500" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Ends: {formatDate(promotion.end_date)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar (visual indication of promotion timeline) */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              promotion.is_active
                                ? "bg-purple-500"
                                : "bg-gray-400"
                            }`}
                            style={{
                              width: promotion.is_active ? "60%" : "100%",
                            }}
                          ></div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button
                            className={`flex-1 h-10 ${
                              promotion.is_active
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!promotion.is_active}
                            onClick={() => {
                              playSound("earn");
                              window.open(promotion.link, "_blank");
                            }}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-purple-200"
                            onClick={() =>
                              window.open(promotion.image, "_blank")
                            }
                          >
                            <FileText className="h-4 w-4 text-purple-500" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Zap className="mx-auto h-12 w-12 text-purple-300 mb-3" />
                  <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100">
                    No active promotions
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Check back soon for upcoming promotions!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Earners Tab */}
        <TabsContent value="earners" className="space-y-4">
          <Card className="border shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30">
              <CardTitle className="flex items-center text-xl">
                <Award className="mr-2 h-5 w-5 text-amber-600" />
                Top Reward Earners
              </CardTitle>
              <CardDescription>
                Users with the highest reward earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading.earners ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                </div>
              ) : topEarners.length > 0 ? (
                <>
                  {/* Desktop Table View - Hidden on mobile */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-amber-50 dark:bg-amber-900/20">
                        <TableRow>
                          <TableHead className="w-[50px] text-center">
                            Rank
                          </TableHead>
                          <TableHead className="w-[200px]">Full Name</TableHead>
                          <TableHead className="w-[150px]">Username</TableHead>
                          <TableHead className="text-center">Date</TableHead>
                          <TableHead className="text-center">
                            Total Rewards
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topEarners.map((earner, index) => (
                          <motion.tr
                            key={earner.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
                            onMouseEnter={() => playSound("hover")}
                          >
                            <TableCell className="text-center">
                              <Badge
                                className={`${getRankBadgeColor(
                                  earner.rank
                                )} w-8 h-8 flex items-center justify-center rounded-full text-lg p-0 font-bold`}
                              >
                                {earner.rank}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {earner.full_name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {earner.username}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="border-gray-200 text-gray-600"
                              >
                                {formatDate(earner.date)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-bold text-green-600">
                              {formatCurrency(earner.total_rewards)}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Leaderboard View - Visible only on mobile */}
                  <div className="md:hidden space-y-3 p-4">
                    {topEarners.map((earner, index) => (
                      <motion.div
                        key={earner.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4 relative overflow-hidden ${
                          earner.rank === 1
                            ? "border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20"
                            : earner.rank === 2
                            ? "border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20"
                            : earner.rank === 3
                            ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
                            : "border-blue-200"
                        }`}
                        onTouchStart={() => playSound("hover")}
                      >
                        {/* Rank Badge - Large and Prominent */}
                        <div className="absolute top-0 right-0">
                          <div
                            className={`${getRankBadgeColor(
                              earner.rank
                            )} w-12 h-12 flex items-center justify-center rounded-bl-lg text-xl font-bold`}
                          >
                            {earner.rank}
                          </div>
                        </div>

                        {/* Trophy Icon for Top 3 */}
                        {earner.rank <= 3 && (
                          <div className="absolute top-2 left-2">
                            <Award
                              className={`h-6 w-6 ${
                                earner.rank === 1
                                  ? "text-yellow-500"
                                  : earner.rank === 2
                                  ? "text-gray-400"
                                  : "text-amber-600"
                              }`}
                            />
                          </div>
                        )}

                        {/* Main Content */}
                        <div className="space-y-3 pr-12">
                          {/* User Information */}
                          <div className={`${earner.rank <= 3 ? "ml-8" : ""}`}>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                              {earner.full_name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              @{earner.username}
                            </p>
                          </div>

                          {/* Reward Amount - Prominent Display */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-green-600">
                                {formatCurrency(earner.total_rewards)}
                              </span>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                Total Rewards
                              </span>
                            </div>

                            {/* Date Badge */}
                            <div className="text-right">
                              <Badge
                                variant="outline"
                                className="border-gray-200 text-gray-600 text-xs"
                              >
                                {formatDate(earner.date)}
                              </Badge>
                            </div>
                          </div>

                          {/* Progress Bar for Visual Appeal (relative to top earner) */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-1000 ${
                                earner.rank === 1
                                  ? "bg-yellow-500"
                                  : earner.rank === 2
                                  ? "bg-gray-400"
                                  : earner.rank === 3
                                  ? "bg-amber-600"
                                  : "bg-blue-500"
                              }`}
                              style={{
                                width: `${
                                  topEarners.length > 0
                                    ? (parseFloat(earner.total_rewards) /
                                        parseFloat(
                                          topEarners[0].total_rewards
                                        )) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>

                          {/* Achievement Badge for Top 3 */}
                          {earner.rank <= 3 && (
                            <div className="flex justify-center pt-2">
                              <Badge
                                className={`${
                                  earner.rank === 1
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                    : earner.rank === 2
                                    ? "bg-gray-100 text-gray-800 border-gray-300"
                                    : "bg-amber-100 text-amber-800 border-amber-300"
                                } px-3 py-1 text-xs font-medium`}
                              >
                                {earner.rank === 1
                                  ? "🏆 CHAMPION"
                                  : earner.rank === 2
                                  ? "🥈 RUNNER-UP"
                                  : "🥉 THIRD PLACE"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-amber-300 mb-3" />
                  <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100">
                    No top earners yet
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Be the first to top the leaderboard!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="border shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
              <CardTitle className="flex items-center text-xl">
                <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                Top Transactions
              </CardTitle>
              <CardDescription>High-value transaction activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading.transactions ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : topTransactions.length > 0 ? (
                <>
                  {/* Desktop Table View - Hidden on mobile */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-green-50 dark:bg-green-900/20">
                        <TableRow>
                          <TableHead className="w-[150px]">Username</TableHead>
                          <TableHead className="w-[120px]">
                            Transaction ID
                          </TableHead>
                          <TableHead className="text-center">Date</TableHead>
                          <TableHead className="text-center">
                            Total Amount
                          </TableHead>
                          <TableHead className="text-center">Earned</TableHead>
                          <TableHead className="text-center">Spent</TableHead>
                          <TableHead className="text-center">
                            Withdrawn
                          </TableHead>
                          <TableHead className="w-[150px]">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topTransactions.map((transaction, index) => (
                          <motion.tr
                            key={transaction.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-green-50/50 dark:hover:bg-green-900/10"
                            onMouseEnter={() => playSound("hover")}
                          >
                            <TableCell className="font-medium">
                              {transaction.username}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {transaction.transaction_id}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="border-gray-200 text-gray-600"
                              >
                                {formatDate(transaction.transaction_date)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              {formatCurrency(transaction.total_amount)}
                            </TableCell>
                            <TableCell className="text-center text-green-600 font-medium">
                              {parseFloat(transaction.amount_earned) > 0 ? (
                                <div className="flex items-center justify-center">
                                  <ArrowUp className="mr-1 h-3 w-3" />
                                  {formatCurrency(transaction.amount_earned)}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center text-red-600 font-medium">
                              {parseFloat(transaction.amount_spent) > 0 ? (
                                <div className="flex items-center justify-center">
                                  <ArrowDown className="mr-1 h-3 w-3" />
                                  {formatCurrency(transaction.amount_spent)}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center text-amber-600 font-medium">
                              {parseFloat(transaction.amount_withdrawn) > 0 ? (
                                formatCurrency(transaction.amount_withdrawn)
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <p
                                className="max-w-[150px] truncate"
                                title={transaction.notes}
                              >
                                {transaction.notes || "—"}
                              </p>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Compact Professional Cards */}
                  <div className="md:hidden space-y-2 p-3">
                    {topTransactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3 space-y-2"
                        onTouchStart={() => playSound("hover")}
                      >
                        {/* Header Row */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                #{index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {transaction.username}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                {transaction.transaction_id}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {formatCurrency(transaction.total_amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.transaction_date)}
                            </p>
                          </div>
                        </div>

                        {/* Financial Data Row */}
                        <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex space-x-4 text-xs">
                            {parseFloat(transaction.amount_earned) > 0 && (
                              <div className="flex items-center text-green-600">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                <span className="font-medium">
                                  {formatCurrency(transaction.amount_earned)}
                                </span>
                              </div>
                            )}
                            {parseFloat(transaction.amount_spent) > 0 && (
                              <div className="flex items-center text-red-600">
                                <ArrowDown className="w-3 h-3 mr-1" />
                                <span className="font-medium">
                                  {formatCurrency(transaction.amount_spent)}
                                </span>
                              </div>
                            )}
                            {parseFloat(transaction.amount_withdrawn) > 0 && (
                              <div className="flex items-center text-amber-600">
                                <DollarSign className="w-3 h-3 mr-1" />
                                <span className="font-medium">
                                  {formatCurrency(transaction.amount_withdrawn)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Notes Row (Only if notes exist) */}
                        {transaction.notes && (
                          <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              {transaction.notes}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <BarChart2 className="mx-auto h-12 w-12 text-green-300 mb-3" />
                  <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                    No transactions yet
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Start earning to see your activity here!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Visualizations Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Transaction Distribution */}
        <Card className="border shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
            <CardTitle className="flex items-center text-lg">
              <BarChart2 className="mr-2 h-5 w-5 text-blue-600" />
              Transaction Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of transaction amounts by user
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            {loading.transactions ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : topTransactions.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={prepareTransactionData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => [`$${value}`, ""]} />
                  <Legend />
                  <Bar dataKey="earned" name="Earned" fill="#10B981" />
                  <Bar dataKey="spent" name="Spent" fill="#EF4444" />
                  <Bar dataKey="withdrawn" name="Withdrawn" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <BarChart2 className="mx-auto h-12 w-12 text-blue-300 mb-3" />
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                  No data available
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Complete transactions to see your distribution
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Earner Distribution */}
        <Card className="border shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardTitle className="flex items-center text-lg">
              <Award className="mr-2 h-5 w-5 text-purple-600" />
              Reward Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of rewards by top earners
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            {loading.earners ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : topEarners.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={prepareEarnerDistributionData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {prepareEarnerDistributionData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [`$${value}`, "Rewards"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <Award className="mx-auto h-12 w-12 text-purple-300 mb-3" />
                <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100">
                  No data available
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Earn rewards to see your distribution
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}