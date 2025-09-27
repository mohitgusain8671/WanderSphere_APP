import api from '../../utils/api';
import { WANDERLUST_ROUTES } from '../../utils/constants';

export const createWanderlustSlice = (set, get) => ({
  // Wanderlust State
  destinations: [],
  adventureTip: null,
  isWanderlustLoading: false,
  error: null,

  // Actions
  setDestinations: (destinations) => set({ destinations }),
  setAdventureTip: (adventureTip) => set({ adventureTip }),
  setIsWanderlustLoading: (isWanderlustLoading) => set({ isWanderlustLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Get today's wanderlust destinations
  getTodaysWanderlust: async () => {
    set({ isWanderlustLoading: true, error: null });

    try {
      const response = await api.get(WANDERLUST_ROUTES.GET_DESTINATIONS);
      const data = response.data;

      if (data.success) {
        set({ 
          destinations: data.data.destinations, 
          isWanderlustLoading: false, 
          error: null 
        });

        return { success: true, data: data.data.destinations };
      } else {
        set({ error: data.message, isWanderlustLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch wanderlust destinations';
      set({ error: errorMessage, isWanderlustLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get today's adventure tip
  getTodaysAdventureTip: async () => {
    set({ isWanderlustLoading: true, error: null });

    try {
      const response = await api.get(WANDERLUST_ROUTES.GET_TIP);
      const data = response.data;

      if (data.success) {
        set({ 
          adventureTip: {
            tip: data.data.tip,
            author: data.data.author
          }, 
          isWanderlustLoading: false, 
          error: null 
        });

        return { success: true, data: data.data };
      } else {
        set({ error: data.message, isWanderlustLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch adventure tip';
      set({ error: errorMessage, isWanderlustLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get all wanderlust destinations (with pagination)
  getAllWanderlustDestinations: async (page = 1, limit = 10) => {
    set({ isWanderlustLoading: true, error: null });

    try {
      const response = await api.get(`${WANDERLUST_ROUTES.GET_ALL_DESTINATIONS}?page=${page}&limit=${limit}`);
      const data = response.data;

      if (data.success) {
        set({ isWanderlustLoading: false, error: null });
        return { success: true, data: data.data };
      } else {
        set({ error: data.message, isWanderlustLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch all wanderlust destinations';
      set({ error: errorMessage, isWanderlustLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get all adventure tips (with pagination)
  getAllAdventureTips: async (page = 1, limit = 10) => {
    set({ isWanderlustLoading: true, error: null });

    try {
      const response = await api.get(`${WANDERLUST_ROUTES.GET_ALL_TIPS}?page=${page}&limit=${limit}`);
      const data = response.data;

      if (data.success) {
        set({ isWanderlustLoading: false, error: null });
        return { success: true, data: data.data };
      } else {
        set({ error: data.message, isWanderlustLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch all adventure tips';
      set({ error: errorMessage, isWanderlustLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Regenerate today's content (admin only)
  regenerateTodaysContent: async (type = 'both') => {
    set({ isWanderlustLoading: true, error: null });

    try {
      const response = await api.post(WANDERLUST_ROUTES.REGENERATE_CONTENT, { type });
      const data = response.data;

      if (data.success) {
        // Update state with new content
        if (data.data.wanderlust) {
          set({ destinations: data.data.wanderlust.destinations });
        }
        if (data.data.tip) {
          set({ adventureTip: { tip: data.data.tip.tip, author: data.data.tip.author } });
        }
        
        set({ isWanderlustLoading: false, error: null });
        return { success: true, data: data.data };
      } else {
        set({ error: data.message, isWanderlustLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to regenerate content';
      set({ error: errorMessage, isWanderlustLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Initialize wanderlust data (call on app start)
  initializeWanderlust: async () => {
    const { getTodaysWanderlust, getTodaysAdventureTip } = get();
    
    try {
      // Fetch both destinations and tip in parallel
      await Promise.all([
        getTodaysWanderlust(),
        getTodaysAdventureTip()
      ]);
    } catch (error) {
      console.error('Error initializing wanderlust:', error);
    }
  }
});