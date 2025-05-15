// components/wallet/WalletCard.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WalletInfo } from '@/services/walletService';
import { ArrowDownLeft, ArrowUpRight, CreditCard, Exchange } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WalletCardProps {
  walletInfo: WalletInfo;
  isLoading: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
  onConvertPoints?: () => void;
}

export default function WalletCard({ walletInfo, isLoading, onDeposit, onWithdraw, onConvertPoints }: WalletCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 dark:from-purple-950 dark:to-indigo-950 dark:border-purple-900/50">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate a percentage for a progress bar
  const totalFunds = walletInfo.balance + walletInfo.reward_points;
  const balancePercentage = totalFunds > 0 ? (walletInfo.balance / totalFunds) * 100 : 50;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 dark:from-purple-950 dark:to-indigo-950 dark:border-purple-900/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-indigo-600" />
          Your Wallet
        </CardTitle>
        <CardDescription>
          Manage your funds and reward points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Funds</span>
            <span className="text-sm font-medium">₹{totalFunds.toFixed(2)}</span>
          </div>
          <Progress value={balancePercentage} className="h-2">
            <div 
              className="absolute inset-0 flex items-center justify-center text-[10px] text-white"
              style={{ left: `${Math.min(Math.max(balancePercentage - 10, 0), 90)}%` }}
            >
              Balance
            </div>
            <div 
              className="absolute inset-0 flex items-center justify-center text-[10px] text-white"
              style={{ left: `${Math.min(Math.max(balancePercentage + 10, 10), 100)}%` }}
            >
              Rewards
            </div>
          </Progress>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Available Balance</div>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">₹{walletInfo.balance.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Reward Points</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">₹{walletInfo.reward_points.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            onClick={onDeposit} 
            className="flex flex-col h-auto py-3 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            <ArrowUpRight className="h-4 w-4 mb-1" />
            <span>Deposit</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onWithdraw} 
            className="flex flex-col h-auto py-3 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <ArrowDownLeft className="h-4 w-4 mb-1" />
            <span>Withdraw</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onConvertPoints} 
            disabled={!onConvertPoints || walletInfo.reward_points <= 0}
            className="flex flex-col h-auto py-3 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
          >
            <Exchange className="h-4 w-4 mb-1" />
            <span>Convert</span>
          </Button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>
            Status: <span className="font-medium">{walletInfo.status === 'approved' ? 'Active' : walletInfo.status}</span>
          </p>
          <p className="mt-1">
            Total earnings: ₹{walletInfo.total_earning.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}