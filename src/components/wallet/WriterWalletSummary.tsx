// components/wallet/WriterWalletSummary.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WalletInfo } from '@/services/walletService';
import { Link } from 'react-router-dom';
import { Wallet, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WriterWalletSummaryProps {
  walletInfo: WalletInfo;
  isLoading: boolean;
}

export default function WriterWalletSummary({ walletInfo, isLoading }: WriterWalletSummaryProps) {
  // Calculate progress percentage for publish threshold
  const publishThreshold = 100; // ₹100 required to publish
  const progressPercentage = Math.min(100, (walletInfo.balance / publishThreshold) * 100);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-purple-600" />
          Writer Wallet
        </CardTitle>
        <CardDescription>
          Manage your balance for publishing articles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">₹{walletInfo.balance.toFixed(2)}</span>
              <span className="ml-2 text-sm text-muted-foreground">Current Balance</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Publishing Threshold</span>
                <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            {walletInfo.balance < publishThreshold && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-md flex items-start gap-2 text-sm mt-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Insufficient balance for publishing</p>
                  <p className="mt-1">You need ₹{publishThreshold.toFixed(2)} to publish an article. Add funds to your wallet.</p>
                </div>
              </div>
            )}
            
            <Link to="/wallet">
              <Button variant="outline" className="w-full mt-4 justify-between">
                Manage Wallet
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}