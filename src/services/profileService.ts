import api from './api';

export interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  role: string;
  website?: string;
  bio?: string;
  photo?: File | null | string; // Allow string for URLs
}

const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('/auth/my-profile/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get profile:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to get profile information');
    }
  },

  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      console.log('Sending profile data:', profileData); // Debug
      const dataToSend = { ...profileData };
      // Remove fields that belong to CustomUser, not UserProfile
      delete dataToSend.username;
      delete dataToSend.email;
      delete dataToSend.full_name;
      delete dataToSend.role;

      if (dataToSend.photo instanceof File) {
        const formData = new FormData();
        Object.entries(dataToSend).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'photo' && value instanceof File) {
              formData.append('photo', value);
            } else if (typeof value === 'number') {
              formData.append(key, value.toString());
            } else if (typeof value === 'string') {
              formData.append(key, value);
            }
          }
        });
        const response = await api.patch('/auth/my-profile/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      } else {
        delete dataToSend.photo; // Remove photo if not a File
        const response = await api.patch('/auth/my-profile/', dataToSend);
        return response.data;
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error.response?.data);
      const errors = error.response?.data;
      if (errors && typeof errors === 'object') {
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(errorMessages || 'Failed to update profile information');
      }
      throw new Error(error.response?.data?.detail || 'Failed to update profile information');
    }
  },

  getProfileCompleteness: (profile: UserProfile): number => {
    const requiredFields = [
      'first_name',
      'last_name',
      'phone_number',
      'address',
      'age',
      'gender',
      'website',
      'bio',
    ];
    const completedFields = requiredFields.filter((field) => {
      const value = profile[field as keyof UserProfile];
      return value !== undefined && value !== null && value !== '';
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  },
};

export default profileService;