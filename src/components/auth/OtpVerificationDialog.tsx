
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import authService from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { Mail, Check } from "lucide-react";

interface OtpVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function OtpVerificationDialog({
  isOpen,
  onClose,
  email,
}: OtpVerificationDialogProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!otp) {
      toast.error("Please enter the OTP sent to your email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOtp({
        email,
        otp,
      });

      toast.success(response.message || "Email verified successfully");
      navigate("/login");
      onClose();
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.detail || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Verify your email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center py-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <p className="text-sm text-center text-muted-foreground">
            We've sent a verification code to <span className="font-medium text-black">{email}</span>.
            Please enter the code below.
          </p>
          
          <div className="flex flex-col gap-4 pt-2">
            <Input
              placeholder="Enter verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
            <Button 
              onClick={handleVerify} 
              disabled={isLoading} 
              size="lg"
              className="mt-2"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center">
                  <Check className="mr-2 h-5 w-5" />
                  Verify Email
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
