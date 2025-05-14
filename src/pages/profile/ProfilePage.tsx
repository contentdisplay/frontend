import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
} from 'lucide-react';
import profileService, { UserProfile } from '@/services/profileService';
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
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profile = await profileService.getProfile();
        setUserProfile(profile);
        profileForm.reset({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone_number: profile.phone_number || '',
          address: profile.address || '',
          age: profile.age ?? undefined,
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

    loadProfile();
  }, []);

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
      const updatedProfile = await profileService.updateProfile(data);
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

  const isProfileIncomplete = userProfile && (
    !userProfile.phone_number ||
    !userProfile.address ||
    !userProfile.age ||
    !userProfile.gender
  );

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
                    {userProfile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-semibold">{userProfile?.full_name || userProfile?.username}</h3>
                  <Badge className="capitalize bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900/50 dark:to-blue-900/50 dark:text-purple-300">
                    {userProfile?.role}
                  </Badge>
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
                      <span>{userProfile?.gender}</span>
                    </div>
                  )}
                  {userProfile?.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a href={userProfile?.website} target="_blank" className="text-blue-600 hover:underline">
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900">
                    <DialogHeader>
                      <DialogTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                        Edit Profile
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="first_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                      placeholder="Your first name"
                                      className="pl-10 bg-white/50 dark:bg-gray-950/50"
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
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                      placeholder="Your last name"
                                      className="pl-10 bg-white/50 dark:bg-gray-950/50"
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
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input
                                    placeholder="Your phone number"
                                    className="pl-10 bg-white/50 dark:bg-gray-950/50"
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
                              <FormLabel className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                Address
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Your address"
                                  {...field}
                                  rows={3}
                                  className="resize-none bg-white/50 dark:bg-gray-950/50"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4" />
                                  Age
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Your age"
                                    type="number"
                                    className="bg-white/50 dark:bg-gray-950/50"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white/50 dark:bg-gray-950/50">
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={profileForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1.5">
                                <Globe className="h-4 w-4" />
                                Website
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input
                                    placeholder="https://example.com"
                                    className="pl-10 bg-white/50 dark:bg-gray-950/50"
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
                              <FormLabel className="flex items-center gap-1.5">
                                <Info className="h-4 w-4" />
                                Bio
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us about yourself"
                                  {...field}
                                  rows={4}
                                  className="resize-none bg-white/50 dark:bg-gray-950/50"
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
                              <FormLabel className="flex items-center gap-1.5">
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
                                    className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Choose Photo
                                  </Button>
                                  {avatarPreview && (
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={avatarPreview} alt="Preview" />
                                    </Avatar>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}