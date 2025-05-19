import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Menu
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import dashboardService from "@/services/dashboardService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export default function UserDashboard() {
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [offers, setOffers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [topEarners, setTopEarners] = useState([]);
  const [topTransactions, setTopTransactions] = useState([]);
  const [loading, setLoading] = useState({
    offers: true,
    promotions: true,
    earners: true,
    transactions: true,
  });
  const [activeTab, setActiveTab] = useState("offers");
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view on mount and resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobileView();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobileView);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Placeholder for sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
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
      console.error('Failed to fetch offers:', error);
      toast.error('Failed to load active offers');
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
      console.error('Failed to fetch promotions:', error);
      toast.error('Failed to load promotions');
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
      console.error('Failed to fetch top earners:', error);
      toast.error('Failed to load top earners');
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
      console.error('Failed to fetch top transactions:', error);
      toast.error('Failed to load top transactions');
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }));
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get badge color based on rank
  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return "bg-yellow-500 text-yellow-950";
      case 2: return "bg-gray-400 text-gray-950";
      case 3: return "bg-amber-700 text-amber-50";
      default: return "bg-blue-600 text-white";
    }
  };

  // Prepare data for charts
  const prepareTransactionData = () => {
    return topTransactions.map(transaction => ({
      name: isMobileView ? transaction.username.substring(0, 3) : transaction.username,
      earned: parseFloat(transaction.amount_earned),
      spent: parseFloat(transaction.amount_spent),
      withdrawn: parseFloat(transaction.amount_withdrawn)
    }));
  };

  const prepareEarnerDistributionData = () => {
    return topEarners.map(earner => ({
      name: isMobileView ? earner.username.substring(0, 3) : earner.username,
      value: parseFloat(earner.total_rewards)
    }));
  };

  // Generate colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Render a mobile-friendly table or fallback to a card view
  const renderResponsiveTable = (data, loading, columns, renderRow, emptyStateIcon, emptyStateTitle, emptyStateMessage) => {
    if (loading) {
      return (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (data.length === 0) {
      return (
        <div className="text-center py-6">
          {emptyStateIcon}
          <h3 className="text-lg font-medium mt-2">{emptyStateTitle}</h3>
          <p className="text-sm text-gray-500">{emptyStateMessage}</p>
        </div>
      );
    }

    // For smaller screens, use a card-based layout
    if (isMobileView) {
      return (
        <div className="space-y-4 px-2">
          {data.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
            >
              {renderRow(item, index, true)}
            </motion.div>
          ))}
        </div>
      );
    }

    // For larger screens, use a table layout
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900/20">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className || ""}>
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10"
                onMouseEnter={() => playSound('hover')}
              >
                {renderRow(item, index, false)}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Render the offers tab content
  const renderOffersContent = () => {
    const offerColumns = [
      { title: "Title", className: "w-[200px]" },
      { title: "Description", className: "w-[300px]" },
      { title: "Image", className: "text-center" },
      { title: "Reward", className: "text-center" },
      { title: "Redemption", className: "text-center" },
      { title: "Code", className: "text-center" },
      { title: "Expires", className: "text-center" },
      { title: "Actions", className: "text-center" }
    ];

    const renderOfferRow = (offer, index, isMobile) => {
      if (isMobile) {
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{offer.title}</h3>
              <Badge className="bg-blue-100 text-blue-800">
                {offer.redemption_code || "No Code"}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">{offer.description}</p>
            
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold text-green-600">{formatCurrency(offer.reward_amount)}</span>
              <Badge variant="outline" className="border-red-200 text-red-600">
                {formatDate(offer.expires_at)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 p-0 h-8 w-8"
                  onClick={() => window.open(offer.image, '_blank')}
                >
                  <FileText className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 p-0 h-8 w-8"
                  onClick={() => window.open(offer.redemption_link, '_blank')}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
                onClick={() => {
                  playSound('earn');
                  window.open(offer.redemption_link, '_blank');
                }}
              >
                Claim
              </Button>
            </div>
          </div>
        );
      }

      return (
        <>
          <TableCell className="font-medium">{offer.title}</TableCell>
          <TableCell>
            <p className="max-w-[300px] truncate" title={offer.description}>
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
                    onClick={() => window.open(offer.image, '_blank')}
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
                    onClick={() => window.open(offer.redemption_link, '_blank')}
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
            <Badge variant="outline" className="border-red-200 text-red-600">
              {formatDate(offer.expires_at)}
            </Badge>
          </TableCell>
          <TableCell className="text-center">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
              onClick={() => {
                playSound('earn');
                window.open(offer.redemption_link, '_blank');
              }}
            >
              Claim
            </Button>
          </TableCell>
        </>
      );
    };

    return renderResponsiveTable(
      offers,
      loading.offers,
      offerColumns,
      renderOfferRow,
      <Gift className="mx-auto h-12 w-12 text-blue-300 mb-3" />,
      "No active offers",
      "Check back soon for new opportunities!"
    );
  };

  // Render the promotions tab content
  const renderPromotionsContent = () => {
    const promotionColumns = [
      { title: "Title", className: "w-[200px]" },
      { title: "Description", className: "w-[300px]" },
      { title: "Image", className: "text-center" },
      { title: "Link", className: "text-center" },
      { title: "Start Date", className: "text-center" },
      { title: "End Date", className: "text-center" },
      { title: "Priority", className: "text-center" },
      { title: "Actions", className: "text-center" }
    ];

    const renderPromotionRow = (promotion, index, isMobile) => {
      if (isMobile) {
        return (
          <div className={`space-y-3 ${!promotion.is_active ? "opacity-60" : ""}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{promotion.title}</h3>
              {promotion.priority > 0 && (
                <Badge className="bg-purple-100 text-purple-800">
                  Priority: {promotion.priority}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">{promotion.description}</p>
            
            <div className="flex justify-between items-center mt-2">
              <Badge variant="outline" className="border-green-200 text-green-600">
                {formatDate(promotion.start_date)}
              </Badge>
              <Badge variant="outline" className="border-red-200 text-red-600">
                {formatDate(promotion.end_date)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-500 p-0 h-8 w-8"
                  onClick={() => window.open(promotion.image, '_blank')}
                >
                  <FileText className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-500 p-0 h-8 w-8"
                  onClick={() => window.open(promotion.link, '_blank')}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
                disabled={!promotion.is_active}
                onClick={() => {
                  playSound('earn');
                  window.open(promotion.link, '_blank');
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        );
      }

      return (
        <>
          <TableCell className="font-medium">{promotion.title}</TableCell>
          <TableCell>
            <p className="max-w-[300px] truncate" title={promotion.description}>
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
                    onClick={() => window.open(promotion.image, '_blank')}
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
                    onClick={() => window.open(promotion.link, '_blank')}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open Link</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
          <TableCell className="text-center">
            <Badge variant="outline" className="border-green-200 text-green-600">
              {formatDate(promotion.start_date)}
            </Badge>
          </TableCell>
          <TableCell className="text-center">
            <Badge variant="outline" className="border-red-200 text-red-600">
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
                playSound('earn');
                window.open(promotion.link, '_blank');
              }}
            >
              View Details
            </Button>
          </TableCell>
        </>
      );
    };

    return renderResponsiveTable(
      promotions,
      loading.promotions,
      promotionColumns,
      renderPromotionRow,
      <Zap className="mx-auto h-12 w-12 text-purple-300 mb-3" />,
      "No active promotions",
      "Check back soon for upcoming promotions!"
    );
  };

  // Render the top earners tab content
  const renderTopEarnersContent = () => {
    const earnerColumns = [
      { title: "Rank", className: "w-[50px] text-center" },
      { title: "Full Name", className: "w-[200px]" },
      { title: "Username", className: "w-[150px]" },
      { title: "Date", className: "text-center" },
      { title: "Total Rewards", className: "text-center" }
    ];

    const renderEarnerRow = (earner, index, isMobile) => {
      if (isMobile) {
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Badge className={`${getRankBadgeColor(earner.rank)} w-8 h-8 flex items-center justify-center rounded-full text-lg p-0 font-bold flex-shrink-0`}>
                {earner.rank}
              </Badge>
              <div>
                <h3 className="font-semibold">{earner.full_name}</h3>
                <p className="text-sm text-gray-500">@{earner.username}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <Badge variant="outline" className="border-gray-200 text-gray-600">
                {formatDate(earner.date)}
              </Badge>
              <span className="font-bold text-green-600">{formatCurrency(earner.total_rewards)}</span>
            </div>
          </div>
        );
      }

      return (
        <>
          <TableCell className="text-center">
            <Badge className={`${getRankBadgeColor(earner.rank)} w-8 h-8 flex items-center justify-center rounded-full text-lg p-0 font-bold`}>
              {earner.rank}
            </Badge>
          </TableCell>
          <TableCell className="font-medium">{earner.full_name}</TableCell>
          <TableCell className="text-muted-foreground">{earner.username}</TableCell>
          <TableCell className="text-center">
            <Badge variant="outline" className="border-gray-200 text-gray-600">
              {formatDate(earner.date)}
            </Badge>
          </TableCell>
          <TableCell className="text-center font-bold text-green-600">
            {formatCurrency(earner.total_rewards)}
          </TableCell>
        </>
      );
    };

    return renderResponsiveTable(
      topEarners,
      loading.earners,
      earnerColumns,
      renderEarnerRow,
      <Award className="mx-auto h-12 w-12 text-amber-300 mb-3" />,
      "No top earners yet",
      "Be the first to top the leaderboard!"
    );
  };

  // Render the transactions tab content
  const renderTransactionsContent = () => {
    const transactionColumns = [
      { title: "Username", className: "w-[150px]" },
      { title: "Transaction ID", className: "w-[120px]" },
      { title: "Date", className: "text-center" },
      { title: "Total Amount", className: "text-center" },
      { title: "Earned", className: "text-center" },
      { title: "Spent", className: "text-center" },
      { title: "Withdrawn", className: "text-center" },
      { title: "Notes", className: "w-[150px]" }
    ];

    const renderTransactionRow = (transaction, index, isMobile) => {
      if (isMobile) {
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">@{transaction.username}</h3>
              <Badge variant="outline" className="border-gray-200 text-gray-600">
                {formatDate(transaction.transaction_date)}
              </Badge>
            </div>
            
            <p className="text-xs font-mono text-gray-500 truncate">
              ID: {transaction.transaction_id}
            </p>
            
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
              {parseFloat(transaction.amount_earned) > 0 && (
                <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="mr-1 h-3 w-3" />
                    <span className="font-medium">Earned</span>
                  </div>
                  <span>{formatCurrency(transaction.amount_earned)}</span>
                </div>
              )}
              
              {parseFloat(transaction.amount_spent) > 0 && (
                <div className="flex flex-col items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="flex items-center text-red-600">
                    <ArrowDown className="mr-1 h-3 w-3" />
                    <span className="font-medium">Spent</span>
                  </div>
                  <span>{formatCurrency(transaction.amount_spent)}</span>
                </div>
              )}
              
              {parseFloat(transaction.amount_withdrawn) > 0 && (
                <div className="flex flex-col items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                  <div className="flex items-center text-amber-600">
                    <span className="font-medium">Withdrawn</span>
                  </div>
                  <span>{formatCurrency(transaction.amount_withdrawn)}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="font-bold">{formatCurrency(transaction.total_amount)}</span>
            </div>
            
            {transaction.notes && (
              <p className="text-sm italic text-gray-600">
                Note: {transaction.notes}
              </p>
            )}
          </div>
        );
      }

      return (
        <>
          <TableCell className="font-medium">{transaction.username}</TableCell>
          <TableCell className="font-mono text-xs">
            {transaction.transaction_id}
          </TableCell>
          <TableCell className="text-center">
            <Badge variant="outline" className="border-gray-200 text-gray-600">
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
            <p className="max-w-[150px] truncate" title={transaction.notes}>
              {transaction.notes || "—"}
            </p>
          </TableCell>
        </>
      );
    };

    return renderResponsiveTable(
      topTransactions,
      loading.transactions,
      transactionColumns,
      renderTransactionRow,
      <BarChart2 className="mx-auto h-12 w-12 text-green-300 mb-3" />,
      "No transactions yet",
      "Start earning to see your activity here!"
    );
  };

  return (
    <div className="space-y-4 p-4 md:p-6 md:space-y-6">
      {/* Welcome Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome Back, {user?.name || "User"}!
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Here's what's happening with your account today
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSound}
          onMouseEnter={() => playSound('hover')}
          className="transition-all hover:scale-105 self-end sm:self-auto"
        >
          {soundEnabled ? (
            <Volume2 className="h-5 w-5 text-green-500" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Main Tabs Section - Responsive */}
      <Tabs defaultValue="offers" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${isMobileView ? 'grid-cols-2 gap-y-2' : 'grid-cols-4'}`}>
          <TabsTrigger 
            value="offers" 
            onClick={() => playSound('click')}
            className="flex items-center justify-center"
          >
            <Gift className={`${isMobileView ? 'mr-1' : 'mr-2'} h-4 w-4`} />
            <span className={isMobileView ? "text-sm" : ""}>Offers</span>
          </TabsTrigger>
          <TabsTrigger 
            value="promotions" 
            onClick={() => playSound('click')}
            className="flex items-center justify-center"
          >
            <Zap className={`${isMobileView ? 'mr-1' : 'mr-2'} h-4 w-4`} />
            <span className={isMobileView ? "text-sm" : ""}>Promotions</span>
          </TabsTrigger>
          <TabsTrigger 
            value="earners" 
            onClick={() => playSound('click')}
            className="flex items-center justify-center"
          >
            <Award className={`${isMobileView ? 'mr-1' : 'mr-2'} h-4 w-4`} />
            <span className={isMobileView ? "text-sm" : ""}>Top Earners</span>
          </TabsTrigger>
          <TabsTrigger 
            value="transactions" 
            onClick={() => playSound('click')}
            className="flex items-center justify-center"
          >
            <DollarSign className={`${isMobileView ? 'mr-1' : 'mr-2'} h-4 w-4`} />
            <span className={isMobileView ? "text-sm" : ""}>Transactions</span>
          </TabsTrigger>
        </TabsList>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-4">
          <Card className="border shadow-md overflow-hidden">
            <CardHeader className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 ${isMobileView ? 'px-4 py-3' : ''}`}>
              <CardTitle className={`flex items-center ${isMobileView ? 'text-lg' : 'text-xl'}`}>
                <Gift className="mr-2 h-5 w-5 text-blue-600" />
                Special Offers
              </CardTitle>
              <CardDescription className={isMobileView ? "text-sm" : ""}>
                Limited-time opportunities to maximize your rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderOffersContent()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <Card className="border shadow-md overflow-hidden">
            <CardHeader className={`bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 ${isMobileView ? 'px-4 py-3' : ''}`}>
              <CardTitle className={`flex items-center ${isMobileView ? 'text-lg' : 'text-xl'}`}>
                <Zap className="mr-2 h-5 w-5 text-purple-600" />
                Active Promotions
              </CardTitle>
              <CardDescription className={isMobileView ? "text-sm" : ""}>
                Current promotional campaigns and special events
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderPromotionsContent()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Earners Tab */}
        <TabsContent value="earners" className="space-y-4">
          <Card className="border shadow-md overflow-hidden">
            <CardHeader className={`bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 ${isMobileView ? 'px-4 py-3' : ''}`}>
              <CardTitle className={`flex items-center ${isMobileView ? 'text-lg' : 'text-xl'}`}>
                <Award className="mr-2 h-5 w-5 text-amber-600" />
                Top Reward Earners
              </CardTitle>
              <CardDescription className={isMobileView ? "text-sm" : ""}>
                Users with the highest reward earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderTopEarnersContent()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="border shadow-md overflow-hidden">
            <CardHeader className={`bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 ${isMobileView ? 'px-4 py-3' : ''}`}>
              <CardTitle className={`flex items-center ${isMobileView ? 'text-lg' : 'text-xl'}`}>
                <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                Top Transactions
              </CardTitle>
              <CardDescription className={isMobileView ? "text-sm" : ""}>
                High-value transaction activity
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderTransactionsContent()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Visualizations Section - Responsive */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Transaction Distribution */}
        <Card className="border shadow-md">
          <CardHeader className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 ${isMobileView ? 'px-4 py-3' : ''}`}>
            <CardTitle className={`flex items-center ${isMobileView ? 'text-lg' : 'text-xl'}`}>
              <BarChart2 className="mr-2 h-5 w-5 text-blue-600" />
              Transaction Distribution
            </CardTitle>
            <CardDescription className={isMobileView ? "text-sm" : ""}>
              Breakdown of transaction amounts by user
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            {loading.transactions ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : topTransactions.length > 0 ? (
              <ResponsiveContainer width="100%" height={isMobileView ? 250 : 300}>
                <BarChart 
                  data={prepareTransactionData()} 
                  margin={isMobileView ? { top: 5, right: 10, left: 0, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: isMobileView ? 10 : 12 }} />
                  <YAxis tick={{ fontSize: isMobileView ? 10 : 12 }} width={isMobileView ? 30 : 40} />
                  <RechartsTooltip formatter={(value) => [`$${value}`, '']} />
                  <Legend wrapperStyle={{ fontSize: isMobileView ? 10 : 12 }} />
                  <Bar dataKey="earned" name="Earned" fill="#10B981" />
                  <Bar dataKey="spent" name="Spent" fill="#EF4444" />
                  <Bar dataKey="withdrawn" name="Withdrawn" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6">
                <BarChart2 className="mx-auto h-10 w-10 text-blue-300 mb-2" />
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">No data available</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Complete transactions to see your distribution</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Earner Distribution */}
        <Card className="border shadow-md">
          <CardHeader className={`bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 ${isMobileView ? 'px-4 py-3' : ''}`}>
            <CardTitle className={`flex items-center ${isMobileView ? 'text-lg' : 'text-xl'}`}>
              <Award className="mr-2 h-5 w-5 text-purple-600" />
              Reward Distribution
            </CardTitle>
            <CardDescription className={isMobileView ? "text-sm" : ""}>
              Breakdown of rewards by top earners
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            {loading.earners ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : topEarners.length > 0 ? (
              <ResponsiveContainer width="100%" height={isMobileView ? 250 : 300}>
                <PieChart>
                  <Pie
                    data={prepareEarnerDistributionData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobileView ? 40 : 60}
                    outerRadius={isMobileView ? 70 : 100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => isMobileView ? 
                      `${(percent * 100).toFixed(0)}%` : 
                      `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={!isMobileView}
                  >
                    {prepareEarnerDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`$${value}`, 'Rewards']} />
                  <Legend 
                    wrapperStyle={{ fontSize: isMobileView ? 10 : 12 }} 
                    layout={isMobileView ? "horizontal" : "vertical"} 
                    verticalAlign={isMobileView ? "bottom" : "middle"} 
                    align={isMobileView ? "center" : "right"}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6">
                <Award className="mx-auto h-10 w-10 text-purple-300 mb-2" />
                <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100">No data available</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">Earn rewards to see your distribution</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}