import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import authService from "../../services/authService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Invalid verification link.");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setSuccess(response.message);
        toast.success(response.message);
        setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3 seconds
      } catch (error: any) {
        setError(error.message || "Email verification failed.");
        toast.error(error.message || "Email verification failed.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Verifying your email address...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isVerifying ? (
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2">Verifying...</span>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-lg">{success}</p>
              <p className="text-sm text-gray-600">
                You will be redirected to the login page in a few seconds.
              </p>
              <Button onClick={() => navigate("/login")} variant="outline">
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <p className="text-lg">{error}</p>
              <p className="text-sm text-gray-600">
                Please try again or contact support.
              </p>
              <Button onClick={() => navigate("/register")} variant="outline">
                Back to Register
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}