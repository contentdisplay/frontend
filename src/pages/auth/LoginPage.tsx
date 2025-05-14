import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AtSign, KeyRound, LogIn } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, { message: "Email or username is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await login(values.emailOrUsername, values.password);
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.message || "Login failed. Please check your credentials.";
      if (message.includes("not verified")) {
        toast.error(message, {
          action: {
            label: "Resend OTP",
            onClick: () => window.location.href = "/verify-email", // Add route for OTP resend
          },
        });
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailOrUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Enter your email or username" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Enter your password" 
                            className="pl-10" 
                            {...field} 
                            type="password" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <LogIn className="mr-2 h-5 w-5" />
                      Sign in
                    </span>
                  )}
                </Button>

                <div className="text-center text-sm">
                  <Link to="/admin/login" className="text-purple-600 hover:text-purple-500 hover:underline">
                    Admin Login
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
          
          {/* <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Test Credentials
              </span>
            </div>
          </div> */}

          {/* <CardFooter className="block p-6 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-gray-50 hover:bg-gray-100 text-sm transition-colors">
                <p className="font-semibold">Normal User</p>
                <p className="text-xs text-gray-500">user@example.com</p>
                <p className="text-xs text-gray-500">password123</p>
              </div>
              <div className="p-3 rounded-md bg-gray-50 hover:bg-gray-100 text-sm transition-colors">
                <p className="font-semibold">Content Writer</p>
                <p className="text-xs text-gray-500">writer@example.com</p>
                <p className="text-xs text-gray-500">password123</p>
              </div>
            </div> */}

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Don't have an account?</span>{" "}
              <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500 hover:underline">
                Create a new account
              </Link>
            </div>
          {/* </CardFooter> */}
        </Card>
      </div>
    </div>
  );
}