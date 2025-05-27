import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Copy,
  Users,
  Gift,
  Share2,
  ExternalLink,
  Trophy,
  Clock,
  CheckCircle
} from 'lucide-react';
import profileService, { ReferralStats } from '@/services/profileService';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReferralSectionProps {
  referralCode: string;
  referralCount: number;
  referredBy?: string | null;
}

export default function ReferralSection({ 
  referralCode, 
  referralCount, 
  referredBy 
}: ReferralSectionProps) {
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      setIsLoading(true);
      const stats = await profileService.getReferralStats();
      setReferralStats(stats);
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopySuccess(true);
      toast.success('Referral code copied to clipboard!');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral code:', error);
      toast.error('Failed to copy referral code');
    }
  };

  const shareReferralLink = async () => {
    const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join our platform!',
          text: `Use my referral code to get started: ${referralCode}`,
          url: referralUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(referralUrl);
        toast.success('Referral link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy referral link');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          <Gift className="h-6 w-6 text-purple-600" />
          Referral Program
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Referred By Section */}
        {referredBy && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800/50">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <Trophy className="h-5 w-5" />
              <span className="font-medium">You joined through a referral!</span>
            </div>
            <p className="text-blue-700 dark:text-blue-400 mt-1">
              Referred by: <span className="font-semibold">{referredBy}</span>
            </p>
          </div>
        )}

        {/* Your Referral Code */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            Your Referral Code
          </h3>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700">
            <div className="flex-1">
              <code className="text-2xl font-mono font-bold text-purple-700 dark:text-purple-300">
                {referralCode}
              </code>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Share this code with friends to earn rewards!
              </p>
            </div>
            
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={copyReferralCode}
                      variant="outline"
                      size="sm"
                      className={`transition-all duration-200 ${
                        copySuccess 
                          ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400' 
                          : 'hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20'
                      }`}
                    >
                      {copySuccess ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copySuccess ? 'Copied!' : 'Copy referral code'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={shareReferralLink}
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Share referral link
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Total Referrals</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
              {referralCount}
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">Points Earned</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
              {referralStats?.total_rewards_earned || referralCount * 200}
            </p>
          </div>
        </div>

        {/* Recent Referrals */}
        {!isLoading && referralStats && referralStats.recent_referrals.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Recent Referrals
              </h4>
              
              <div className="space-y-2">
                {referralStats.recent_referrals.map((referral, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {referral.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{referral.username}</p>
                        <p className="text-xs text-gray-500">{formatDate(referral.date_joined)}</p>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={referral.is_verified ? "default" : "secondary"}
                      className={referral.is_verified 
                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400" 
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }
                    >
                      {referral.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* How it works */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
          <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">How Referrals Work</h4>
          <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
            <li>• Share your referral code with friends</li>
            <li>• When they register using your code, you earn 200 reward points</li>
            <li>• Points are added to your wallet automatically</li>
            <li>• Both you and your friend get notified!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}