import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  CreditCard, 
  Filter,
  Wallet as WalletIcon
} from "lucide-react";
import WalletCard from "@/components/wallet/WalletCard";
import TransactionsList from "@/components/wallet/TransactionsList";
import walletService, { WalletInfo, Transaction } from "@/services/walletService";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WalletPage() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    loadWalletInfo();
    loadTransactions(timeFilter);
  }, [timeFilter]);

  const loadWalletInfo = async () => {
    try {
      setIsWalletLoading(true);
      const data = await walletService.getWalletInfo();
      setWalletInfo(data);
    } catch (error) {
      console.error("Failed to load wallet info:", error);
      toast.error("Failed to load wallet information");
    } finally {
      setIsWalletLoading(false);
    }
  };

  const loadTransactions = async (filter: string = "all") => {
    try {
      setIsTransactionsLoading(true);
      const filterParam = filter !== "all" ? filter : undefined;
      const data = await walletService.getTransactions(filterParam);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  const handleAddFunds = () => {
    toast.info("This feature is not implemented yet.");
  };

  // Filter transactions based on the active tab
  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "all") return true;
    if (activeTab === "income") 
      return ["deposit", "earn", "refund"].includes(transaction.transaction_type);
    if (activeTab === "spending") 
      return ["withdraw", "spend"].includes(transaction.transaction_type);
    return true;
  });

  const stats = {
    income: transactions
      .filter(t => ["deposit", "earn", "refund"].includes(t.transaction_type))
      .reduce((sum, t) => sum + t.amount, 0),
    spending: transactions
      .filter(t => ["withdraw", "spend"].includes(t.transaction_type))
      .reduce((sum, t) => sum + t.amount, 0),
    articles: transactions
      .filter(t => t.transaction_type === "earn" && t.article_title)
      .length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Wallet</h2>
        <p className="text-muted-foreground">
          Manage your funds and view transaction history
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Wallet Card */}
        <div className="md:col-span-1">
          {walletInfo && (
            <WalletCard 
              walletInfo={walletInfo} 
              isLoading={isWalletLoading} 
            />
          )}
        </div>
        
        {/* Stats Card */}
        <Card className="md:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Your Stats</CardTitle>
            <CardDescription>Overview of your financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center space-y-1 bg-white/50 dark:bg-white/5 rounded-lg p-3">
                <div className="rounded-full bg-green-100 p-2">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="font-bold">${stats.income.toFixed(2)}</p>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-1 bg-white/50 dark:bg-white/5 rounded-lg p-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <ArrowDownLeft className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs text-muted-foreground">Spending</p>
                <p className="font-bold">${stats.spending.toFixed(2)}</p>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-1 bg-white/50 dark:bg-white/5 rounded-lg p-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground">Articles</p>
                <p className="font-bold">{stats.articles}</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                <WalletIcon className="mr-1 h-4 w-4" />
                Manage Funds
              </Button>
              <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">
                <CreditCard className="mr-1 h-4 w-4" />
                Connect Bank
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="spending">Spending</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="15days">Last 15 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TransactionsList 
          transactions={filteredTransactions} 
          isLoading={isTransactionsLoading}
          title={
            activeTab === "all" 
              ? "Transaction History" 
              : activeTab === "income"
                ? "Income History" 
                : "Spending History"
          }
        />
      </div>
    </div>
  );
}