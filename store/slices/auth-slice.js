import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { API_BASE_URL } from "@/utils/constants";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
};

export const createAuthSlice = (set, get) => ({
  // Auth State
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isAuthLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user }),
  updateUserProfile: async (profileUpdates) => {
    set({ isAuthLoading: true, error: null });
    try {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      
      const response = await axios.put(`${API_BASE_URL}/users/profile`, profileUpdates, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data;
      
      if (data.success) {
        // Update the user in store with new profile data
        set({ 
          user: data.data.user,
          isAuthLoading: false, 
          error: null 
        });
        
        return { success: true, data: data.data.user, message: data.message };
      } else {
        set({ error: data.message, isAuthLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      set({ error: errorMessage, isAuthLoading: false });
      return { success: false, error: errorMessage };
    }
  },
  
  // Upload profile picture
  uploadProfilePicture: async (imageUri) => {
    set({ isAuthLoading: true, error: null });
    try {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg'
      });
      
      const response = await axios.post(`${API_BASE_URL}/users/profile/picture`, formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const data = response.data;
      
      if (data.success) {
        // Update the user in store with new profile picture
        const currentUser = get().user;
        set({ 
          user: { ...currentUser, profilePicture: data.data.profilePicture },
          isAuthLoading: false, 
          error: null 
        });
        
        return { success: true, data: data.data, message: data.message };
      } else {
        set({ error: data.message, isAuthLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile picture upload failed';
      set({ error: errorMessage, isAuthLoading: false });
      return { success: false, error: errorMessage };
    }
  },
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Login Action
  login: async (credentials) => {
    set({ isAuthLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        credentials
      );
      const data = response.data;

      if (data.success) {
        const { user, accessToken, refreshToken } = data.data;

        // Store only tokens securely
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isAuthLoading: false,
          error: null,
        });

        return { success: true, data: user, message: data.message };
      } else {
        set({ error: data.message, isAuthLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      set({ error: errorMessage, isAuthLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Register Action
  register: async (userData) => {
    set({ isAuthLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData
      );
      const data = response.data;

      if (data.success) {
        set({ isAuthLoading: false, error: null });
        return { 
          success: true, 
          data: data.data,
          message: data.message 
        };
      } else {
        set({ error: data.message, isAuthLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      set({ error: errorMessage, isAuthLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Forgot Password Action
  forgotPassword: async (email) => {
    set({ isAuthLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        { email }
      );
      const data = response.data;

      if (data.success) {
        set({ isAuthLoading: false, error: null });
        return { success: true, data: data.data };
      } else {
        set({ error: data.message, isAuthLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset email";
      set({ error: errorMessage, isAuthLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Reset Password Action
  resetPassword: async (resetData) => {
    set({ isAuthLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password`,
        resetData
      );
      const data = response.data;

      if (data.success) {
        set({ isAuthLoading: false, error: null });
        return { success: true, data: data.data };
      } else {
        set({ error: data.message, isAuthLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Password reset failed";
      set({ error: errorMessage, isAuthLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Logout Action
  logout: async () => {
    set({ isLoading: true });
    try {
      // Get token for logout API call
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      
    //   // Try to call logout endpoint if token exists
    //   if (token) {
    //     try {
    //       await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
    //         headers: {
    //           'Authorization': `Bearer ${token}`
    //         }
    //       });
    //     } catch (logoutError) {
    //       // Continue with local logout even if API call fails
    //       console.warn("Logout API call failed:", logoutError);
    //     }
    //   }

      // Clear secure storage (only tokens now)
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

      // Clear auth state
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Clear all other slices except theme
      const state = get();
      
      // Clear posts
      if (state.clearPosts) state.clearPosts();
      
      // Clear stories
      if (state.clearStories) state.clearStories();
      
      // Clear friends
      if (state.clearFriendsData) state.clearFriendsData();
      
      // Clear notifications
      if (state.clearNotifications) state.clearNotifications();
      
      // Clear quiz
      if (state.clearQuizState) state.clearQuizState();
      
      // Clear contest
      if (state.clearContestState) state.clearContestState();
      
      // Clear leaderboard
      if (state.clearLeaderboardState) state.clearLeaderboardState();
      
      // Clear query
      if (state.clearQueryState) state.clearQueryState();
      
      // Clear itinerary
      if (state.clearItineraryData) state.clearItineraryData();
      
      // Clear admin
      if (state.clearAdminState) state.clearAdminState();
      
      // Clear wanderlust
      if (state.setDestinations && state.setAdventureTip) {
        state.setDestinations([]);
        state.setAdventureTip(null);
      }
      
      // Clear messages
      if (state.setChats && state.setCurrentChat) {
        state.setChats([]);
        state.setCurrentChat(null);
        set({ messages: {}, typingUsers: new Map() });
      }
      
      // Clear buddy
      if (state.myBuddyProfile !== undefined) {
        set({
          myBuddyProfile: null,
          buddies: [],
          selectedBuddy: null,
          userBookings: [],
          buddyBookings: [],
          selectedBooking: null,
          buddyPagination: null,
          bookingPagination: null,
        });
      }

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Validate token and get user info
  validateTokenAndGetUser: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!accessToken) {
        return { success: false, error: 'No token found' };
      }

      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = response.data;
      
      if (data.success) {
        return { success: true, user: data.data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Token validation failed' 
      };
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = response.data;
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get user';
      return { success: false, error: errorMessage };
    }
  },

  // Get user posts
  getUserPosts: async (userId, page = 1) => {
    try {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await axios.get(`${API_BASE_URL}/posts/user/${userId}?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = response.data;
      
      if (data.success) {
        return { success: true, data: data.data.posts };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get user posts';
      return { success: false, error: errorMessage };
    }
  },

  // Initialize Auth (check stored tokens)
  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

      if (accessToken) {
        // Validate token with backend and get user info
        const validation = await get().validateTokenAndGetUser();
        
        if (validation.success) {
          set({
            user: validation.user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Token is invalid, clear storage
          await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ isLoading: false });
    }
  },
});
