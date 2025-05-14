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
  Wallet as WalletIcon,
  DollarSign
} from "lucide-react";
import WalletCard from "@/components/wallet/WalletCard";
import TransactionsList from "@/components/wallet/TransactionsList";
import walletService, { WalletInfo, Transaction, QRCode } from "@/services/walletService";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WalletPage() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState<QRCode | null>(null);

  const pricingOptions = [
    { payment: 1000, balance: 1500 },
    { payment: 500, balance: 700 },
    { payment: 100, balance: 130 },
  ];

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

  const fetchQRCode = async () => {
    try {
      const qrCodeData = await walletService.initiatePaymentRequest();
      setQrCode(qrCodeData);
    } catch (error) {
      toast.error("Failed to load QR code");
      setQrCode(null);
    }
  };

  const handleDepositOpen = async () => {
    await fetchQRCode();
    setShowDepositDialog(true);
  };

  const handleWithdrawOpen = async () => {
    await fetchQRCode();
    setShowWithdrawDialog(true);
  };

  const handleDeposit = async () => {
    if (!selectedAmount || !screenshot) {
      toast.error("Please select an amount and upload a screenshot");
      return;
    }

    try {
      await walletService.createPaymentRequest('deposit', selectedAmount, screenshot);
      toast.success("Deposit request submitted successfully");
      setShowDepositDialog(false);
      setSelectedAmount(null);
      setScreenshot(null);
      setQrCode(null);
    } catch (error) {
      toast.error("Failed to submit deposit request");
    }
  };

  const handleWithdraw = async () => {
    if (!screenshot) {
      toast.error("Please upload a screenshot of the ₹100 payment");
      return;
    }

    try {
      await walletService.createPaymentRequest('withdraw', 100, screenshot);
      toast.success("Withdraw request submitted successfully");
      setShowWithdrawDialog(false);
      setScreenshot(null);
      setQrCode(null);
    } catch (error) {
      toast.error("Failed to submit withdraw request");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

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
        <div className="md:col-span-1">
          {walletInfo && (
            <WalletCard 
              walletInfo={walletInfo} 
              isLoading={isWalletLoading} 
              onDeposit={handleDepositOpen}
              onWithdraw={handleWithdrawOpen}
            />
          )}
        </div>
        
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
                <p className="font-bold">₹{stats.income.toFixed(2)}</p>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-1 bg-white/50 dark:bg-white/5 rounded-lg p-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <ArrowDownLeft className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs text-muted-foreground">Spending</p>
                <p className="font-bold">₹{stats.spending.toFixed(2)}</p>
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
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600 border-blue-200"
                onClick={handleDepositOpen}
              >
                <DollarSign className="mr-1 h-4 w-4" />
                Deposit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-purple-600 border-purple-200"
                onClick={handleWithdrawOpen}
              >
                <DollarSign className="mr-1 h-4 w-4" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
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

      {/* Deposit Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Select a pricing option, scan the QR code to make payment, and upload the payment screenshot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {pricingOptions.map((option) => (
                <Button
                  key={option.payment}
                  variant={selectedAmount === option.payment ? "default" : "outline"}
                  className="flex flex-col h-auto py-3"
                  onClick={() => setSelectedAmount(option.payment)}
                >
                  <span>Pay ₹{option.payment}</span>
                  <span className="text-sm">Get ₹{option.balance}</span>
                </Button>
              ))}
            </div>
            {qrCode ? (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Scan this QR code to make payment:</p>
                <img src={qrCode.image} alt={qrCode.description || "QR Code"} className="w-32 h-32 mx-auto" />
                {qrCode.description && <p className="text-sm text-center mt-2">{qrCode.description}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading QR code...</p>
            )}
            <div>
              <Label htmlFor="screenshot">Upload Payment Screenshot</Label>
              <Input
                id="-screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepositDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeposit} disabled={!selectedAmount || !screenshot || !qrCode}>
              Submit Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              You need to make a payment of ₹100 to create a secure SSL socket. Scan the QR code and upload the payment screenshot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrCode ? (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Scan this QR code to make payment:</p>
                <img src={qrCode.image} alt={qrCode.description || "QR Code"} className="w-32 h-32 mx-auto" />
                {qrCode.description && <p className="text-sm text-center mt-2">{qrCode.description}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading QR code...</p>
            )}
            <div>
              <Label htmlFor="screenshot">Upload ₹100 Payment Screenshot</Label>
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={!screenshot || !qrCode}>
              Submit Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}