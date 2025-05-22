// RegisterPage.tsx - Updated with promo code field
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Lock, Gift, UserCheck } from "lucide-react";
import { toast } from "sonner";
import authService from "@/services/authService";

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be less than 20 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  referralCode: z
    .string()
    .optional(),
  promoCode: z
    .string()
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoValidation, setPromoValidation] = useState<{
    valid: boolean;
    message: string;
    amount?: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
      promoCode: "",
    },
  });

  const validatePromoCode = async (code: string) => {
    if (!code.trim()) {
      setPromoValidation(null);
      return;
    }

    setIsValidatingPromo(true);
    try {
      const response = await authService.validatePromoCode(code);
      setPromoValidation({
        valid: response.valid,
        message: response.message,
        amount: response.bonus_amount
      });
    } catch (error: any) {
      setPromoValidation({
        valid: false,
        message: error.message || "Error validating promo code"
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      const registrationData = {
        username: values.username,
        email: values.email,
        password: values.password,
        referral_code: values.referralCode || undefined,
        promo_code: values.promoCode || undefined,
      };
      
      const response = await register(registrationData);
      
      // Show success message with promo bonus if applicable
      if (response.promo_bonus) {
        toast.success(`Registration successful! ${response.promo_bonus.message}`, {
          duration: 5000,
        });
      } else {
        toast.success("Registration successful! Please check your email for verification.");
      }
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Join us and start your journey
          </p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Enter your username" 
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Enter your email" 
                            className="pl-10" 
                            type="email"
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
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Enter your password" 
                            className="pl-10" 
                            type="password"
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Confirm your password" 
                            className="pl-10" 
                            type="password"
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
                  name="referralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral Code (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserCheck className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Enter referral code" 
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
                  name="promoCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promo Code (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Gift className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Enter promo code (e.g., ABC346)" 
                            className="pl-10" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value) {
                                validatePromoCode(e.target.value);
                              } else {
                                setPromoValidation(null);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      
                      {/* Promo code validation feedback */}
                      {isValidatingPromo && (
                        <div className="text-sm text-gray-500">
                          Validating promo code...
                        </div>
                      )}
                      
                      {promoValidation && (
                        <div className={`text-sm ${
                          promoValidation.valid 
                            ? 'text-green-600 bg-green-50 border border-green-200 rounded-md p-2' 
                            : 'text-red-600'
                        }`}>
                          {promoValidation.message}
                        </div>
                      )}
                      
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
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Already have an account?</span>{" "}
              <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}