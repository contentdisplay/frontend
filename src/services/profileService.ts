// services/profileService.ts
import api from './api';

export interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  age: number | null;
  gender: string | null;
  role: string;
  website: string | null;
  bio: string | null;
  photo: string | null | File;
}

const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('/auth/profile/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get profile', error);
      throw new Error(error.response?.data?.detail || 'Failed to get profile information');
    }
  },

  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      // Create FormData if there's a photo
      if (profileData.photo instanceof File) {
        const formData = new FormData();
        
        // Add all fields to formData
        Object.entries(profileData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
        
        const response = await api.patch('/auth/profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return response.data;
      } else {
        // Just send regular JSON if no photo
        const response = await api.patch('/auth/profile/', profileData);
        return response.data;
      }
    } catch (error: any) {
      console.error('Failed to update profile', error);
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
      'gender'
    ];

    const optionalFields = [
      'website', 
      'bio', 
      'photo'
    ];

    // Calculate how many required fields are completed
    const requiredFieldsCompleted = requiredFields.filter(
      field => profile[field as keyof UserProfile]
    ).length;
    
    // Calculate how many optional fields are completed
    const optionalFieldsCompleted = optionalFields.filter(
      field => profile[field as keyof UserProfile]
    ).length;

    // Weight required fields more heavily
    const requiredWeight = 80; // 80% of score based on required fields
    const optionalWeight = 20; // 20% of score based on optional fields

    const requiredScore = (requiredFieldsCompleted / requiredFields.length) * requiredWeight;
    const optionalScore = (optionalFieldsCompleted / optionalFields.length) * optionalWeight;
    
    return Math.round(requiredScore + optionalScore);
  },

  requestPromotion: async (): Promise<{ detail: string }> => {
    try {
      const response = await api.post('/auth/promotions/request/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to request promotion', error);
      throw new Error(error.response?.data?.detail || 'Failed to request promotion');
    }
  },

  getPromotionRequest: async (): Promise<{ 
    id: string;
    status: string;
    requested_at: string;
    reviewed_at: string | null;
  } | null> => {
    try {
      const response = await api.get('/auth/promotions/my-request/');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No promotion request found
      }
      console.error('Failed to get promotion request', error);
      throw new Error(error.response?.data?.detail || 'Failed to get promotion request');
    }
  }
};

export default profileService;