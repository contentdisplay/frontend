// import React, { useState, useEffect } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "sonner";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { AlertCircle, Key, User, Mail, Phone, Globe, Info } from "lucide-react";
// import profileService, { UserProfile } from "@/services/profileService";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const profileFormSchema = z.object({
//   first_name: z
//     .string()
//     .min(2, { message: "First name must be at least 2 characters" }),
//   last_name: z
//     .string()
//     .min(2, { message: "Last name must be at least 2 characters" }),
//   phone_number: z
//     .string()
//     .optional(),
//   address: z
//     .string()
//     .optional(),
//   age: z
//     .string()
//     .optional()
//     .transform((val) => (val === "" ? undefined : parseInt(val, 10)))
//     .refine((val) => !val || (val >= 13 && val <= 120), {
//       message: "Age must be between 13 and 120",
//     }),
//   gender: z
//     .enum(["male", "female", "other"])
//     .optional(),
//   website: z
//     .string()
//     .url({ message: "Please enter a valid URL" })
//     .optional()
//     .or(z.literal("")),
//   bio: z
//     .string()
//     .max(500, { message: "Bio cannot exceed 500 characters" })
//     .optional(),
// });

// const securityFormSchema = z
//   .object({
//     current_password: z
//       .string()
//       .min(6, { message: "Password must be at least 6 characters" }),
//     new_password: z
//       .string()
//       .min(6, { message: "Password must be at least 6 characters" }),
//     confirm_password: z.string(),
//   })
//   .refine((data) => data.new_password === data.confirm_password, {
//     message: "Passwords do not match",
//     path: ["confirm_password"],
//   });

// type ProfileFormValues = z.infer<typeof profileFormSchema>;
// type SecurityFormValues = z.infer<typeof securityFormSchema>;

// export default function ProfilePage() {
//   const { user } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingProfile, setIsLoadingProfile] = useState(true);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

//   const profileForm = useForm<ProfileFormValues>({
//     resolver: zodResolver(profileFormSchema),
//     defaultValues: {
//       first_name: "",
//       last_name: "",
//       phone_number: "",
//       address: "",
//       website: "",
//       bio: "",
//     },
//   });

//   const securityForm = useForm<SecurityFormValues>({
//     resolver: zodResolver(securityFormSchema),
//     defaultValues: {
//       current_password: "",
//       new_password: "",
//       confirm_password: "",
//     },
//   });

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         setIsLoadingProfile(true);
//         const profile = await profileService.getProfile();
//         setUserProfile(profile);
        
//         // Update form values
//         profileForm.reset({
//           first_name: profile.first_name || "",
//           last_name: profile.last_name || "",
//           phone_number: profile.phone_number || "",
//           address: profile.address || "",
//           age: profile.age ?? undefined,
//           gender: profile.gender,
//           website: profile.website || "",
//           bio: profile.bio || "",
//         });
//       } catch (error) {
//         console.error("Failed to load profile:", error);
//         toast.error("Failed to load profile information");
//       } finally {
//         setIsLoadingProfile(false);
//       }
//     };

//     loadProfile();
//   }, []);

//   const onProfileSubmit = async (data: ProfileFormValues) => {
//     setIsLoading(true);
    
//     try {
//       const updatedProfile = await profileService.updateProfile(data);
//       setUserProfile(updatedProfile);
//       toast.success("Profile updated successfully");
//     } catch (error) {
//       console.error("Failed to update profile:", error);
//       toast.error("Failed to update profile information");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const onSecuritySubmit = (data: SecurityFormValues) => {
//     setIsLoading(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       setIsLoading(false);
//       toast.success("Password changed successfully");
//       securityForm.reset({
//         current_password: "",
//         new_password: "",
//         confirm_password: "",
//       });
//     }, 1500);
//   };

//   const isProfileIncomplete = !userProfile?.phone_number || 
//                               !userProfile?.address || 
//                               !userProfile?.age || 
//                               !userProfile?.gender;

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
//         <p className="text-muted-foreground">
//           Manage your account settings and preferences
//         </p>
//       </div>

//       {isProfileIncomplete && (
//         <Alert>
//           <AlertCircle className="h-4 w-4" />
//           <AlertTitle>Complete your profile</AlertTitle>
//           <AlertDescription>
//             Please complete your profile information to unlock all features and maximize your rewards.
//           </AlertDescription>
//         </Alert>
//       )}

//       <Tabs defaultValue="general" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="general">General</TabsTrigger>
//           <TabsTrigger value="security">Security</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="general">
//           <Card>
//             <CardHeader>
//               <CardTitle>Profile Information</CardTitle>
//               <CardDescription>
//                 Update your personal information and public profile
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {isLoadingProfile ? (
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
//                     <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
//                   </div>
//                   <div className="space-y-2">
//                     <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
//                     <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex items-center space-x-4">
//                     <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 relative">
//                       {user?.avatar ? (
//                         <img 
//                           src={user.avatar} 
//                           alt={user?.name || "Profile"} 
//                           className="h-full w-full object-cover"
//                         />
//                       ) : (
//                         <div className="h-full w-full flex items-center justify-center text-gray-500 font-medium text-2xl">
//                           {user?.name?.charAt(0).toUpperCase()}
//                         </div>
//                       )}
//                     </div>
//                     <div className="space-y-1">
//                       <div className="font-medium text-lg">{user?.name}</div>
//                       <div className="text-sm text-muted-foreground capitalize">{user?.role}</div>
//                       <Button variant="outline" size="sm">
//                         Change Avatar
//                       </Button>
//                     </div>
//                   </div>

//                   <Separator />

//                   <Form {...profileForm}>
//                     <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
//                       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                         <FormField
//                           control={profileForm.control}
//                           name="first_name"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>First Name</FormLabel>
//                               <FormControl>
//                                 <div className="relative">
//                                   <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                                   <Input placeholder="Your first name" className="pl-10" {...field} />
//                                 </div>
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
                        
//                         <FormField
//                           control={profileForm.control}
//                           name="last_name"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Last Name</FormLabel>
//                               <FormControl>
//                                 <div className="relative">
//                                   <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                                   <Input placeholder="Your last name" className="pl-10" {...field} />
//                                 </div>
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       </div>
                      
//                       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                         <div className="flex flex-col gap-2">
//                           <div className="text-sm font-medium">Email</div>
//                           <div className="relative">
//                             <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                             <Input value={userProfile?.email} readOnly disabled className="pl-10 opacity-60" />
//                           </div>
//                           <div className="text-xs text-muted-foreground">
//                             Your email address cannot be changed
//                           </div>
//                         </div>
                        
//                         <FormField
//                           control={profileForm.control}
//                           name="phone_number"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Phone Number</FormLabel>
//                               <FormControl>
//                                 <div className="relative">
//                                   <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                                   <Input placeholder="Your phone number" className="pl-10" {...field} />
//                                 </div>
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       </div>
                      
//                       <FormField
//                         control={profileForm.control}
//                         name="address"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Address</FormLabel>
//                             <FormControl>
//                               <Textarea
//                                 placeholder="Your address"
//                                 {...field}
//                                 rows={3}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
                      
//                       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                         <FormField
//                           control={profileForm.control}
//                           name="age"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Age</FormLabel>
//                               <FormControl>
//                                 <Input placeholder="Your age" type="number" {...field} />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
                        
//                         <FormField
//                           control={profileForm.control}
//                           name="gender"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Gender</FormLabel>
//                               <Select
//                                 onValueChange={field.onChange}
//                                 defaultValue={field.value}
//                               >
//                                 <FormControl>
//                                   <SelectTrigger>
//                                     <SelectValue placeholder="Select gender" />
//                                   </SelectTrigger>
//                                 </FormControl>
//                                 <SelectContent>
//                                   <SelectItem value="male">Male</SelectItem>
//                                   <SelectItem value="female">Female</SelectItem>
//                                   <SelectItem value="other">Other</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       </div>
                      
//                       <FormField
//                         control={profileForm.control}
//                         name="website"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Website</FormLabel>
//                             <FormControl>
//                               <div className="relative">
//                                 <Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                                 <Input placeholder="https://example.com" className="pl-10" {...field} />
//                               </div>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
                      
//                       <FormField
//                         control={profileForm.control}
//                         name="bio"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Bio</FormLabel>
//                             <FormControl>
//                               <div className="relative">
//                                 <Info className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
//                                 <Textarea
//                                   placeholder="Tell us about yourself"
//                                   {...field}
//                                   rows={4}
//                                   className="pl-10"
//                                 />
//                               </div>
//                             </FormControl>
//                             <FormDescription>
//                               Brief description for your profile. URLs are hyperlinked.
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
                      
//                       <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
//                         {isLoading ? (
//                           <>
//                             <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
//                             Saving...
//                           </>
//                         ) : (
//                           "Save Changes"
//                         )}
//                       </Button>
//                     </form>
//                   </Form>
//                 </>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
        
//         <TabsContent value="security">
//           <Card>
//             <CardHeader>
//               <CardTitle>Password</CardTitle>
//               <CardDescription>
//                 Change your password to keep your account secure
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <Form {...securityForm}>
//                 <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
//                   <FormField
//                     control={securityForm.control}
//                     name="current_password"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Current Password</FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                             <Input
//                               placeholder="•••••••••"
//                               type="password"
//                               className="pl-10"
//                               {...field}
//                             />
//                           </div>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
                  
//                   <Separator />
                  
//                   <FormField
//                     control={securityForm.control}
//                     name="new_password"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>New Password</FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                             <Input
//                               placeholder="•••••••••"
//                               type="password"
//                               className="pl-10"
//                               {...field}
//                             />
//                           </div>
//                         </FormControl>
//                         <FormDescription>
//                           Password must be at least 6 characters long
//                         </FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
                  
//                   <FormField
//                     control={securityForm.control}
//                     name="confirm_password"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Confirm New Password</FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                             <Input
//                               placeholder="•••••••••"
//                               type="password"
//                               className="pl-10"
//                               {...field}
//                             />
//                           </div>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
                  
//                   <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
//                     {isLoading ? (
//                       <>
//                         <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
//                         Changing Password...
//                       </>
//                     ) : (
//                       "Change Password"
//                     )}
//                   </Button>
//                 </form>
//               </Form>
//             </CardContent>
//           </Card>

//           <Card className="mt-6">
//             <CardHeader>
//               <CardTitle>Account</CardTitle>
//               <CardDescription>
//                 Manage your account settings and connected services
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <h4 className="font-medium">Delete Account</h4>
//                   <p className="text-sm text-muted-foreground">
//                     Permanently delete your account and all of your content
//                   </p>
//                 </div>
//                 <Button variant="destructive" size="sm">
//                   Delete Account
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }