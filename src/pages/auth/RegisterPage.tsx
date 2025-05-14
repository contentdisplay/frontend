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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";
import OtpVerificationDialog from "@/components/auth/OtpVerificationDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AtSign, KeyRound, User, Mail, Check } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["user", "writer"]),
  referralCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const { register, requestWriterPromotion } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user",
      referralCode: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const email = await register(
        values.username,
        values.email,
        values.password,
        values.role as UserRole,
        values.referralCode || undefined
      );
      
      // If they selected 'writer' role, send the promotion request
      if (values.role === "writer") {
        try {
          await requestWriterPromotion();
          toast.success("Content writer promotion request submitted for approval.");
        } catch (error) {
          // Just show a warning, but continue with registration
          toast.warning("Account created, but content writer request failed to submit.");
        }
      }
      
      setRegisteredEmail(email);
      setShowOtpDialog(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === "USER_ALREADY_EXISTS" || error.message.includes("already registered")) {
        toast.error("This email or username is already registered. Please try logging in.");
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Join our community and start your journey
          </p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create an account
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
                          <Input placeholder="Choose a username" className="pl-10" {...field} />
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
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Enter your email" className="pl-10" {...field} type="email" />
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
                          <Input placeholder="Create a password" className="pl-10" {...field} type="password" />
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
                          <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Enter referral code" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      {/* <FormLabel>Account Type</FormLabel> */}
                      {/* <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <RadioGroupItem value="user" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex-1">
                              Normal User
                              <p className="text-sm text-muted-foreground">
                                Read and interact with content
                              </p>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <RadioGroupItem value="writer" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex-1">
                              Content Writer
                              <p className="text-sm text-muted-foreground">
                                Create and publish content (requires approval and ₹100 per publication)
                              </p>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Check className="mr-2 h-5 w-5" />
                      Create account
                    </span>
                  )}
                </Button>

                <div className="text-center text-sm mt-6">
                  <span className="text-gray-600">Already have an account?</span>{" "}
                  <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 hover:underline">
                    Sign in instead
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <OtpVerificationDialog 
        isOpen={showOtpDialog}
        onClose={() => setShowOtpDialog(false)}
        email={registeredEmail}
      />
    </div>
  );
}