import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import promotionService from '@/services/promotionService';
import { toast } from 'sonner';

interface PromotionRequestFormProps {
  onSuccess: () => void;
}

export default function PromotionRequestForm({ onSuccess }: PromotionRequestFormProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [agreement, setAgreement] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreement) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await promotionService.requestPromotion(); 
      toast.success('Your request has been submitted successfully!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Writer Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reason">Why do you want to become a writer?</Label>
            <Textarea
              id="reason"
              placeholder="Tell us why you're interested in becoming a content writer and what topics you'd like to write about..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="agreement" 
              checked={agreement}
              onCheckedChange={(checked) => {
                setAgreement(checked === true);
                if (checked) setError('');
              }}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="agreement"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand that my profile will be reviewed and agree to the writer terms and conditions.
              </Label>
              <p className="text-xs text-muted-foreground">
                By agreeing, you acknowledge that 50 credits will be deducted from your wallet upon approval.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}