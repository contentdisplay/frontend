import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, User, ChevronLeft, AlertCircle, Wallet, Clock, Info, FileText, Home } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PromotionRequestForm from '@/components/promotion/PromotionRequestForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import promotionService from '@/services/promotionService';
import profileService from '@/services/profileService';
import walletService from '@/services/walletService';
import { toast } from 'sonner';

export default function PromotionRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatusAndProfile = async () => {
      setIsLoading(true);
      try {
        // Check profile completeness
        const profile = await profileService.getProfile();
        const completeness = profileService.getProfileCompleteness(profile);
        setIsProfileIncomplete(completeness < 100);

        // Check wallet balance
        const wallet = await walletService.getWalletInfo();
        setWalletBalance(wallet.balance);

        // Check if there's an existing promotion request
        try {
          const request = await promotionService.getMyPromotionRequest();
          setExistingRequest(request);
          setIsSubmitted(true);
        } catch (err: any) {
          // If 404, no existing request - which is fine
          if (err.message.includes('404')) {
            setExistingRequest(null);
          } else {
            console.error('Error checking promotion request:', err);
            toast.error('Error checking promotion status');
          }
        }
      } catch (err) {
        console.error('Failed to check user status:', err);
        toast.error('Failed to load your profile information');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatusAndProfile();
  }, []);

  const handleSubmitRequest = async () => {
    if (isProfileIncomplete) {
      toast.error('Please complete your profile first');
      return;
    }

    if (walletBalance < 50) {
      toast.error('Insufficient balance. You need at least 50 credits to become a writer.');
      return;
    }

    setIsSubmitting(true);
    try {
      await promotionService.requestPromotion();
      toast.success('Your promotion request has been submitted successfully!');
      setIsSubmitted(true);
      
      // Refresh request data
      const request = await promotionService.getMyPromotionRequest();
      setExistingRequest(request);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 mb-6">
        Become a Content Writer
      </h1>

      {isProfileIncomplete && (
        <Alert className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-800/40">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Complete Your Profile</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Please complete your profile before submitting a writer request.{' '}
            <Button
              variant="link"
              onClick={() => navigate('/profile')}
              className="p-0 text-amber-700 dark:text-amber-300 underline"
            >
              Update Profile
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {walletBalance < 50 && !isProfileIncomplete && (
        <Alert className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-800/40">
          <Wallet className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Insufficient Balance</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            You need at least 50 credits to become a writer. Your current balance is {walletBalance}.{' '}
            <Button
              variant="link"
              onClick={() => navigate('/wallet')}
              className="p-0 text-amber-700 dark:text-amber-300 underline"
            >
              Add Funds
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-6 flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-blue-100 dark:ring-blue-900/50">
              <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user?.name || user?.username}</h3>
              <Badge className="mt-1 capitalize bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300">
                {user?.role}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {isSubmitted && existingRequest ? (
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Writer Request Status</CardTitle>
            <CardDescription>
              Your request to become a content writer was submitted on {formatDate(existingRequest.requested_at)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              {existingRequest.status === 'pending' ? (
                <Clock className="h-16 w-16 text-yellow-500 animate-pulse" />
              ) : existingRequest.status === 'approved' ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <Info className="h-16 w-16 text-red-500" />
              )}
              
              <Badge className={`text-sm py-1 px-3 ${getStatusBadgeClass(existingRequest.status)}`}>
                {existingRequest.status.toUpperCase()}
              </Badge>
              
              <div className="text-center mt-4">
                {existingRequest.status === 'pending' && (
                  <div className="text-muted-foreground">
                    <p>Your request is currently under review by our admins.</p>
                    <p className="mt-2">Once approved, 50 credits will be deducted from your wallet.</p>
                  </div>
                )}
                
                {existingRequest.status === 'approved' && (
                  <div className="text-muted-foreground">
                    <p>Congratulations! You are now a Content Writer.</p>
                    <p className="mt-2">50 credits have been deducted from your wallet.</p>
                  </div>
                )}
                
                {existingRequest.status === 'rejected' && (
                  <div className="text-muted-foreground">
                    <p>Unfortunately, your request was not approved at this time.</p>
                    <p className="mt-2">Please contact support for more information.</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                
                {existingRequest.status === 'rejected' && (
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setExistingRequest(null);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
                  >
                    Try Again
                  </Button>
                )}
                
                {existingRequest.status === 'approved' && (
                  <Button
                    onClick={() => navigate('/writer/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Writer Dashboard
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Become a Writer</CardTitle>
            <CardDescription>
              Join our content creation team and start publishing your own articles
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <Wallet className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Payment Required</h3>
                  <p className="text-muted-foreground">
                    Becoming a writer requires a one-time fee of 50 credits. Your current balance: <span className="font-semibold">{walletBalance} credits</span>
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Benefits</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Publish your own articles on the platform</li>
                    <li>• Earn credits when users read your content</li>
                    <li>• Build your professional portfolio</li>
                    <li>• Access to writer-exclusive features</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <Info className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Process</h3>
                  <ol className="text-muted-foreground space-y-2">
                    <li>1. Submit your request</li>
                    <li>2. Admin reviews your profile</li>
                    <li>3. Upon approval, 50 credits will be deducted</li>
                    <li>4. Start creating content immediately after approval</li>
                  </ol>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting || isProfileIncomplete || walletBalance < 50}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Writer Request'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}