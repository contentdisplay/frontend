import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AtSign, KeyRound, LogIn } from "lucide-react";
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await adminLogin(emailOrUsername, password);
      toast.success("Admin login successful", {
        description: "Redirecting to dashboard...",
      });
      // Navigation is handled in AuthContext
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast.error(error.message || "Admin login failed", {
        description: "Please check your credentials or ensure you have admin privileges.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Admin Portal
          </h1>
          <p className ejecutable="mt-2 text-sm text-gray-300">
            Access the administration dashboard
          </p>
        </div>
        
        <Card className="border-none shadow-lg bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">Admin Login</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Enter your admin credentials
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="emailOrUsername" className="text-gray-200">Email or Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="emailOrUsername"
                    placeholder="Admin email or username"
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    aria-label="Admin email or username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-gray-200">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    placeholder="Admin password"
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-label="Admin password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-gray-900 hover:bg-gray-200"
                disabled={isLoading}
                size="lg"
                aria-label="Login as Admin"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin mr-2 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn className="mr-2 h-5 w-5" />
                    Login as Admin
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t border-white/10 pt-6">
            <Link to="/forgot-password" className="text-sm text-blue-300 hover:text-blue-100 hover:underline">
              Forgot Password?
            </Link>
            <Link to="/login" className="text-sm text-blue-300 hover:text-blue-100 hover:underline">
              Return to user login
            </Link>
          </CardFooter>
        </Card>
        
        <div className="mt-4 p-4 border border-yellow-600/30 bg-yellow-500/10 backdrop-blur-sm rounded-lg text-sm">
          <p className="font-semibold text-yellow-300">Admin Test Credentials</p>
          <p className="text-xs text-yellow-200 mt-1">admin@example.com</p>
          <p className="text-xs text-yellow-200">admin123</p>
        </div>
      </div>
    </div>
  );
}