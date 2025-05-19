// pages/wallet/WalletPage.tsx
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
  DollarSign,
  Gift,
  Exchange,
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function WalletPage() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [conversionAmount, setConversionAmount] = useState<number>(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState<QRCode | null>(null);
  const [isConverting, setIsConverting] = useState(false);

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

 // pages/wallet/WalletPage.tsx (continued)
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

const handleConvertOpen = () => {
  setConversionAmount(0);
  setShowConvertDialog(true);
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

const handleConvertPoints = async () => {
  if (conversionAmount <= 0) {
    toast.error("Please enter a valid amount to convert");
    return;
  }

  if (walletInfo && walletInfo.reward_points < 2000) {
    toast.error(`You need at least ₹2000 reward points to convert. Currently you have ₹${walletInfo.reward_points.toFixed(2)}.`);
    return;
  }

  if (walletInfo && conversionAmount > walletInfo.reward_points) {
    toast.error(`You only have ₹${walletInfo.reward_points.toFixed(2)} reward points available`);
    return;
  }

  try {
    setIsConverting(true);
    const result = await walletService.convertRewardPoints(conversionAmount);
    setWalletInfo(prevInfo => {
      if (!prevInfo) return null;
      return {
        ...prevInfo,
        balance: result.balance,
        reward_points: result.reward_points
      };
    });
    
    toast.success(`Successfully converted ₹${conversionAmount} reward points to ₹${(conversionAmount/2).toFixed(2)} wallet balance`);
    setShowConvertDialog(false);
    // Reload transactions to show the new conversion transaction
    loadTransactions(timeFilter);
  } catch (error: any) {
    toast.error(error.message || "Failed to convert reward points");
  } finally {
    setIsConverting(false);
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
  if (activeTab === "rewards")
    return transaction.transaction_type === "reward";
  return true;
});

const stats = {
  income: transactions
    .filter(t => ["deposit", "earn", "refund"].includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0),
  spending: transactions
    .filter(t => ["withdraw", "spend"].includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0),
  rewards: transactions
    .filter(t => t.transaction_type === "reward")
    .reduce((sum, t) => sum + t.amount, 0),
  articles: transactions
    .filter(t => (t.transaction_type === "earn" || t.transaction_type === "reward") && t.article_title)
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
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 dark:from-purple-950 dark:to-indigo-950 dark:border-purple-900/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <WalletIcon className="mr-2 h-5 w-5 text-indigo-600" />
                Your Wallet
              </CardTitle>
              <CardDescription>
                Manage your balance and reward points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 dark:bg-white/10 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Main Balance</p>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                    ₹{walletInfo.balance.toFixed(2)}
                  </p>
                  <div className="mt-2 flex flex-col space-y-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-indigo-600 border-indigo-200 w-full"
                      onClick={handleDepositOpen}
                    >
                      <DollarSign className="mr-1 h-4 w-4" />
                      Deposit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-purple-600 border-purple-200 w-full"
                      onClick={handleWithdrawOpen}
                    >
                      <DollarSign className="mr-1 h-4 w-4" />
                      Withdraw
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white/70 dark:bg-white/10 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reward Points</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    ₹{walletInfo.reward_points.toFixed(2)}
                  </p>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-amber-600 border-amber-200 w-full"
                      onClick={handleConvertOpen}
                      disabled={walletInfo.reward_points <= 0}
                    >
                       <ArrowUpRight className="mr-1 h-4 w-4" />
                      Convert to Balance
                    </Button>
                  </div>
                  <p className="text-xs mt-2 text-gray-500">
                    Read articles to earn more reward points
                  </p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-sm text-indigo-700 dark:text-indigo-300 flex items-center">
                <Gift className="h-4 w-4 mr-2" />
                Collect at least 2000 reward points to convert to wallet balance at 50% rate!
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Card className="md:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-900/50">
  <CardHeader className="pb-2">
    <CardTitle className="text-xl">Your Stats</CardTitle>
    <CardDescription>Overview of your financial activity</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
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
          <Gift className="h-5 w-5 text-blue-600" />
        </div>
        <p className="text-xs text-muted-foreground">Reward Points</p>
        <p className="font-bold text-amber-600 dark:text-amber-400">
          ₹{walletInfo?.reward_points.toFixed(2) || '0.00'}
        </p>
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-1 bg-white/50 dark:bg-white/5 rounded-lg p-3">
        <div className="rounded-full bg-indigo-100 p-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
        </div>
        <p className="text-xs text-muted-foreground">Articles</p>
        <p className="font-bold">{stats.articles}</p>
      </div>
    </div>
  </CardContent>
</Card>
    </div>
    
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
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
      
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "all" 
              ? "Transaction History" 
              : activeTab === "income"
                ? "Income History" 
                : activeTab === "spending" 
                  ? "Spending History" 
                  : "Rewards History"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isTransactionsLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`
                      rounded-full p-2
                      ${transaction.transaction_type === 'deposit' || transaction.transaction_type === 'earn' || transaction.transaction_type === 'refund' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                        : transaction.transaction_type === 'reward'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}
                    `}>
                      {transaction.transaction_type === 'deposit' && <ArrowUpRight className="h-5 w-5" />}
                      {transaction.transaction_type === 'withdraw' && <ArrowDownLeft className="h-5 w-5" />}
                      {transaction.transaction_type === 'earn' && <DollarSign className="h-5 w-5" />}
                      {transaction.transaction_type === 'spend' && <CreditCard className="h-5 w-5" />}
                      {transaction.transaction_type === 'refund' && <ArrowUpRight className="h-5 w-5" />}
                      {transaction.transaction_type === 'reward' && <Gift className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.transaction_type === 'deposit' && 'Deposit'}
                        {transaction.transaction_type === 'withdraw' && 'Withdrawal'}
                        {transaction.transaction_type === 'earn' && 'Earning'}
                        {transaction.transaction_type === 'spend' && 'Spending'}
                        {transaction.transaction_type === 'refund' && 'Refund'}
                        {transaction.transaction_type === 'reward' && 'Reward Points'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.article_title 
                          ? transaction.article_title 
                          : transaction.description 
                            ? transaction.description 
                            : `Transaction ${transaction.id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.transaction_type === 'deposit' || transaction.transaction_type === 'earn' || transaction.transaction_type === 'refund' || transaction.transaction_type === 'reward'
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'earn' || transaction.transaction_type === 'refund' || transaction.transaction_type === 'reward'
                      ? '+' 
                      : '-'}₹{transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
            <Label htmlFor="deposit-screenshot">Upload Payment Screenshot</Label>
            <Input
              id="deposit-screenshot"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Please upload a screenshot of your payment confirmation
            </p>
          </div>
          <Alert variant="info" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertTitle className="text-blue-700 dark:text-blue-400">Important Note</AlertTitle>
            <AlertDescription className="text-blue-600 dark:text-blue-400">
              Your deposit will be processed after admin approval, usually within 24 hours.
            </AlertDescription>
          </Alert>
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
            <Label htmlFor="withdraw-screenshot">Upload ₹100 Payment Screenshot</Label>
            <Input
              id="withdraw-screenshot"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Please upload a screenshot of your ₹100 payment
            </p>
          </div>
          <Alert variant="warning" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <AlertTitle className="text-yellow-700 dark:text-yellow-400">Withdrawal Process</AlertTitle>
            <AlertDescription className="text-yellow-600 dark:text-yellow-400">
              After your request is approved, the amount will be transferred to your registered payment method.
            </AlertDescription>
          </Alert>
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

    {/* Convert Reward Points Dialog */}
<Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Convert Reward Points</DialogTitle>
      <DialogDescription>
        Convert your earned reward points to your main wallet balance
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {walletInfo && walletInfo.reward_points < 2000 ? (
        <Alert variant="warning" className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <AlertTitle className="text-yellow-700 dark:text-yellow-400">Minimum Required</AlertTitle>
          <AlertDescription className="text-yellow-600 dark:text-yellow-400">
            You need at least ₹2000 reward points to convert. Currently you have ₹{walletInfo.reward_points.toFixed(2)}.
            Continue reading articles to earn more reward points!
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div>
            <Label htmlFor="conversion-amount">Amount to Convert</Label>
            <Input
              id="conversion-amount"
              type="number"
              min="0"
              max={walletInfo?.reward_points || 0}
              step="0.01"
              value={conversionAmount}
              onChange={(e) => setConversionAmount(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available reward points: ₹{walletInfo?.reward_points.toFixed(2) || '0.00'}
            </p>
          </div>
          
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">Conversion Preview</p>
            <div className="flex items-center mb-2">
              <p className="flex-1">Reward Points to Convert:</p>
              <p className="font-medium text-amber-600">₹{conversionAmount.toFixed(2)}</p>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center mb-2">
              <p className="flex-1">Conversion Rate:</p>
              <p className="font-medium">50%</p>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center">
              <p className="flex-1">Will be added to balance:</p>
              <p className="font-medium text-green-600">₹{(conversionAmount / 2).toFixed(2)}</p>
            </div>
          </div>
        </>
      )}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
        Cancel
      </Button>
      <Button 
        onClick={handleConvertPoints} 
        disabled={conversionAmount <= 0 || (walletInfo && (conversionAmount > walletInfo.reward_points || walletInfo.reward_points < 2000)) || isConverting}
      >
        {isConverting ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            Converting...
          </>
        ) : (
          "Convert Points"
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  </div>
);
}