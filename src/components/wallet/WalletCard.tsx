import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletInfo } from "@/services/walletService";

interface WalletCardProps {
  walletInfo: WalletInfo | null;
  isLoading?: boolean;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

const WalletCard = ({ walletInfo, isLoading = false, onDeposit, onWithdraw }: WalletCardProps) => {
  if (isLoading) {
    return (
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-indigo-950 dark:to-purple-900">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              Your Balance
            </CardTitle>
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!walletInfo) {
    return (
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-indigo-950 dark:to-purple-900">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              Your Balance
            </CardTitle>
          </div>
          <CardDescription>
            Unable to load balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-purple-600">--</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balance = typeof walletInfo.balance === 'number' ? walletInfo.balance : 0;

  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-indigo-950 dark:to-purple-900">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-600" />
            Your Balance
          </CardTitle>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white text-purple-600 border-purple-200"
              onClick={onDeposit}
            >
              Deposit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white text-purple-600 border-purple-200"
              onClick={onWithdraw}
            >
              Withdraw
            </Button>
          </div>
        </div>
        <CardDescription>
          Current available balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-purple-600">₹{balance.toFixed(2)}</span>
          <span className="text-xs text-gray-500 ml-2">INR</span>
        </div>

        <div className="mt-4 flex gap-2">
          <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            <ArrowUpRight className="h-3 w-3" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            <ArrowDownLeft className="h-3 w-3" />
            <span>Spending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;