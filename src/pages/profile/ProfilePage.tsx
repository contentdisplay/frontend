import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  User,
  Mail,
  Phone,
  Globe,
  Info,
  Upload,
  Calendar,
  MapPin,
  Check,
  Edit,
  Award,
  Clock,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import profileService, { UserProfile } from '@/services/profileService';
import walletService, { Transaction } from '@/services/walletService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const profileFormSchema = z.object({
  first_name: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters' })
    .optional(),
  last_name: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters' })
    .optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  age: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : parseInt(val, 10)))
    .refine((val) => !val || (val >= 13 && val <= 120), {
      message: 'Age must be between 13 and 120',
    }),
  gender: z.enum(['male', 'female', 'other']).optional(),
  website: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, { message: 'Bio cannot exceed 500 characters' })
    .optional(),
  photo: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function UserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [promotionStatus, setPromotionStatus] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isRequestingPromotion, setIsRequestingPromotion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      address: '',
      website: '',
      bio: '',
      photo: undefined,
    },
  });

  useEffect(() => {
    loadProfile();
    loadWalletInfo();
    loadPromotionStatus();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await profileService.getProfile();
      setUserProfile(profile);
      
      // Format age to string for the form
      const ageString = profile.age ? String(profile.age) : undefined;
      
      profileForm.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        age: ageString,
        gender: profile.gender,
        website: profile.website || '',
        bio: profile.bio || '',
      });
      setAvatarPreview(typeof profile.photo === 'string' ? profile.photo : null);
      setProfileCompleteness(profileService.getProfileCompleteness(profile));
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile information');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadWalletInfo = async () => {
    try {
      setIsLoadingWallet(true);
      const walletInfo = await walletService.getWalletInfo();
      setWalletBalance(walletInfo.balance);
      
      // Get recent transactions
      const transactions = await walletService.getTransactions('7days');
      setRecentTransactions(transactions.slice(0, 5)); // Show only 5 most recent
    } catch (error) {
      console.error('Failed to load wallet info:', error);
      toast.error('Failed to load wallet information');
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const loadPromotionStatus = async () => {
    try {
      const request = await profileService.getPromotionRequest();
      if (request) {
        setPromotionStatus(request.status);
      } else {
        setPromotionStatus(null);
      }
    } catch (error) {
      console.error('Failed to load promotion status:', error);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      profileForm.setValue('photo', file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.info("Photo selected, don't forget to save your changes");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Convert age string to number for API
      const updatedData = {
        ...data,
        age: data.age ? parseInt(data.age as string, 10) : undefined
      };
      
      const updatedProfile = await profileService.updateProfile(updatedData);
      setUserProfile(updatedProfile);
      setProfileCompleteness(profileService.getProfileCompleteness(updatedProfile));
      setAvatarPreview(typeof updatedProfile.photo === 'string' ? updatedProfile.photo : avatarPreview);
      setIsDialogOpen(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPromotion = async () => {
    setIsRequestingPromotion(true);
    try {
      await profileService.requestPromotion();
      toast.success('Promotion request submitted successfully');
      setPromotionStatus('pending');
      setIsPromotionDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to request promotion:', error);
      toast.error(error.message || 'Failed to request promotion');
    } finally {
      setIsRequestingPromotion(false);
    }
  };

  const isProfileIncomplete = userProfile && (
    !userProfile.phone_number ||
    !userProfile.address ||
    !userProfile.age ||
    !userProfile.gender
  );

  const getStatusBadge = () => {
    if (!promotionStatus) return null;
    
    switch (promotionStatus) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3" />
            Promotion Request Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
            <Check className="h-3 w-3" />
            Promotion Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-100 text-red-800 border-red-300">
            <AlertCircle className="h-3 w-3" />
            Promotion Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const canRequestPromotion = userProfile && 
    profileCompleteness === 100 && 
    walletBalance !== null && 
    walletBalance >= 50 && 
    promotionStatus === null &&
    userProfile.role !== 'writer';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Fix for gender selection to prevent focus recursion
  const handleGenderChange = (value: string) => {
    // Use setTimeout to break the synchronous focus chain
    setTimeout(() => {
      profileForm.setValue('gender', value as 'male' | 'female' | 'other');
    }, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
        Your Profile
      </h2>
      <p className="text-muted-foreground mt-2">Personalize your account and showcase your identity</p>

      {isProfileIncomplete && (
        <Alert className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-800/40">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Complete Your Profile</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Add more details to unlock all features and enhance your experience.
          </AlertDescription>
        </Alert>
      )}

      <Card className="mt-6 border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardContent className="p-6">
          {isLoadingProfile ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-32 w-32 rounded-full bg-gray-200"></div>
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 ring-4 ring-purple-100 dark:ring-purple-900/50 shadow-md">
                  <AvatarImage src={avatarPreview || (typeof userProfile?.photo === 'string' ? userProfile.photo : '')} alt={userProfile?.full_name || 'Profile'} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-4xl font-bold">
                    {userProfile?.full_name?.charAt(0).toUpperCase() || userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h3 className="text-2xl font-semibold">{userProfile?.full_name || userProfile?.username}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="capitalize bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900/50 dark:to-blue-900/50 dark:text-purple-300">
                      {userProfile?.role === 'writer' ? 'Content Writer' : 'Normal User'}
                    </Badge>
                    {getStatusBadge()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{userProfile?.email}</span>
                  </div>
                  {userProfile?.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{userProfile?.phone_number}</span>
                    </div>
                  )}
                  {userProfile?.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{userProfile?.address}</span>
                    </div>
                  )}
                  {userProfile?.age && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>{userProfile?.age} years</span>
                    </div>
                  )}
                  {userProfile?.gender && (
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="capitalize">{userProfile?.gender}</span>
                    </div>
                  )}
                  {userProfile?.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a href={userProfile?.website} target="_blank" className="text-blue-600 hover:underline truncate">
                        {userProfile?.website}
                      </a>
                    </div>
                  )}
                </div>
                
                {userProfile?.bio && (
                  <div className="mt-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Info className="h-5 w-5 text-muted-foreground" />
                      About
                    </h4>
                    <p className="text-muted-foreground mt-2">{userProfile?.bio}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mt-4">
                  <h4 className="text-sm font-medium text-purple-700 dark:text-purple-400">Profile Completeness</h4>
                  <div className="flex-1">
                    <Progress
                      value={profileCompleteness}
                      className="h-2 bg-gray-200"
                      style={{ background: 'linear-gradient(to right, #f5f3ff, #eff6ff)' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-300">{profileCompleteness}%</span>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <Edit className="hсука-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-4 sm:p-6">
                      <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                          Edit Profile
                        </DialogTitle>
                        <DialogDescription className="text-sm sm:text-base">
                          Update your profile information to complete your account
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="first_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm sm:text-base">First Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input
                                        placeholder="Your first name"
                                        className="pl-10 bg-white/50 dark:bg-gray-950/50 h-12 text-sm sm:text-base"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="last_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm sm:text-base">Last Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                      <Input
                                        placeholder="Your last name"
                                        className="pl-10 bg-white/50 dark:bg-gray-950/50 h-12 text-sm sm:text-base"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={profileForm.control}
                            name="phone_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm sm:text-base">Phone Number</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                      placeholder="Your phone number"
                                      className="pl-10 bg-white/50 dark:bg-gray-950/50 h-12 text-sm sm:text-base"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 text-sm sm:text-base">
                                  <MapPin className="h-4 w-4" />
                                  Address
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Your address"
                                    {...field}
                                    rows={3}
                                    className="resize-none bg-white/50 dark:bg-gray-950/50 text-sm sm:text-base"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="age"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5 text-sm sm:text-base">
                                    <Calendar className="h-4 w-4" />
                                    Age
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Your age"
                                      type="number"
                                      className="bg-white/50 dark:bg-gray-950/50 h-12 text-sm sm:text-base"
                                      {...field}
                                      value={field.value ?? ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">Gender</FormLabel>
                              <select
                                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white/50 dark:bg-gray-950/50"
                                onChange={(e) => handleGenderChange(e.target.value)}
                                value={profileForm.getValues('gender') || ''}
                              >
                                <option value="" disabled>Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                              {profileForm.formState.errors.gender && (
                                <p className="text-sm font-medium text-destructive">{profileForm.formState.errors.gender.message}</p>
                              )}
                            </FormItem>
                          </div>
                          <FormField
                            control={profileForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 text-sm sm:text-base">
                                  <Globe className="h-4 w-4" />
                                  Website
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                      placeholder="https://example.com"
                                      className="pl-10 bg-white/50 dark:bg-gray-950/50 h-12 text-sm sm:text-base"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 text-sm sm:text-base">
                                  <Info className="h-4 w-4" />
                                  Bio
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us about yourself"
                                    {...field}
                                    rows={4}
                                    className="resize-none bg-white/50 dark:bg-gray-950/50 text-sm sm:text-base"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="photo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 text-sm sm:text-base">
                                  <Upload className="h-4 w-4" />
                                  Profile Photo
                                </FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-4">
                                    <Input
                                      type="file"
                                      ref={fileInputRef}
                                      onChange={handleAvatarChange}
                                      accept="image/*"
                                      className="hidden"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={triggerFileInput}
                                      className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 h-12 text-sm sm:text-base"
                                    >
                                      <Upload className="h-4 w-4 mr-2" />
                                      Choose Photo
                                    </Button>
                                    {avatarPreview && (
                                      <Avatar className="h-12 w-12">
                                        <AvatarImage src={avatarPreview} alt="Preview" />
                                        <AvatarFallback>
                                          {userProfile?.full_name?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                              className="h-12 text-sm sm:text-base"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-sm sm:text-base"
                            >
                              {isLoading ? (
                                <span className="flex items-center gap-2">
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                                  Saving...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Check className="h-4 w-4" />
                                  Save Changes
                                </span>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  {canRequestPromotion && (
                    <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20">
                          <Award className="h-4 w-4" />
                          Become a Content Writer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Become a Content Writer</DialogTitle>
                          <DialogDescription>
                            Upgrade your account to access content creation features.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                              <Award className="h-5 w-5" />
                              Content Writer Benefits
                            </h4>
                            <ul className="mt-2 space-y-2 text-purple-700 dark:text-purple-400">
                              <li className="flex items-start gap-2">
                                <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>Create and publish articles</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>Earn from your content</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>Access exclusive writing tools</span>
                              </li>
                            </ul>
                          </div>
                          
                          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertTitle className="text-amber-800 dark:text-amber-300">Promotion Fee</AlertTitle>
                            <AlertDescription className="text-amber-700 dark:text-amber-400">
                              A one-time fee of 50 credits will be deducted from your wallet upon approval.
                              <div className="mt-2 font-medium">
                                Current balance: <span className="text-green-600 dark:text-green-400">{walletBalance ?? 0} credits</span>
                              </div>
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPromotionDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleRequestPromotion}
                            disabled={isRequestingPromotion}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            {isRequestingPromotion ? (
                              <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                                Processing...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Request Promotion
                              </span>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {/* Wallet button */}
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                    onClick={() => navigate('/wallet')}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span className="flex items-center gap-1">
                      Wallet
                      {walletBalance !== null && (
                        <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900/30 dark:text-green-300">
                          {walletBalance}
                        </span>
                      )}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        {/* Transactions section */}
        <Separator className="my-2" />
        <CardHeader className="pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-500" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingWallet ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No transactions found. Visit your wallet to make a deposit.
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.transaction_type === 'deposit' || transaction.transaction_type === 'earn' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'earn' ? (
                        <DollarSign className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{transaction.transaction_type}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</div>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.transaction_type === 'deposit' || transaction.transaction_type === 'earn' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'earn' 
                      ? `+${transaction.amount}` 
                      : `-${transaction.amount}`
                    }
                  </span>
                </div>
              ))}
              
              <div className="flex justify-center pt-3">
                <Button 
                  variant="ghost" 
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  onClick={() => navigate('/wallet')}
                >
                  View All Transactions
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}