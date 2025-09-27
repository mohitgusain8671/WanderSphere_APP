import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_HOST
  ? `${process.env.EXPO_PUBLIC_API_HOST}/api`
  : "http://localhost:5000/api";

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
  updateUserProfile: (profileUpdates) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...profileUpdates } });
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

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

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
