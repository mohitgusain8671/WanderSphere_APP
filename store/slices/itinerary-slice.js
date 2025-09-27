import api from '../../utils/api';
import { ITINERARY_ROUTES } from '../../utils/constants';

export const createItinerarySlice = (set, get) => ({
  // Itinerary State
  itineraries: [],
  currentItinerary: null,
  popularDestinations: [],
  isItineraryLoading: false,
  isGenerating: false,
  error: null,
  pagination: null,

  // Actions
  setItineraries: (itineraries) => set({ itineraries }),
  setCurrentItinerary: (itinerary) => set({ currentItinerary: itinerary }),
  setPopularDestinations: (destinations) => set({ popularDestinations: destinations }),
  setIsItineraryLoading: (loading) => set({ isItineraryLoading: loading }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setPagination: (pagination) => set({ pagination }),

  // Generate new itinerary
  generateItinerary: async (preferences) => {
    set({ isGenerating: true, error: null });

    try {
      const response = await api.post(ITINERARY_ROUTES.GENERATE, preferences);
      const data = response.data;

      if (data.success) {
        const newItinerary = data.data.itinerary;
        
        // Add to itineraries list
        const { itineraries } = get();
        set({ 
          itineraries: [newItinerary, ...itineraries],
          currentItinerary: newItinerary,
          isGenerating: false,
          error: null 
        });

        return { success: true, data: newItinerary };
      } else {
        set({ error: data.message, isGenerating: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate itinerary';
      set({ error: errorMessage, isGenerating: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get user's itineraries
  getUserItineraries: async (page = 1, limit = 10, search = '') => {
    set({ isItineraryLoading: true, error: null });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`${ITINERARY_ROUTES.GET_USER_ITINERARIES}?${params}`);
      const data = response.data;

      if (data.success) {
        set({
          itineraries: data.data.itineraries,
          pagination: data.data.pagination,
          isItineraryLoading: false,
          error: null
        });

        return { success: true, data: data.data };
      } else {
        set({ error: data.message, isItineraryLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch itineraries';
      set({ error: errorMessage, isItineraryLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get specific itinerary by ID
  getItineraryById: async (itineraryId) => {
    set({ isItineraryLoading: true, error: null });

    try {
      const response = await api.get(ITINERARY_ROUTES.GET_ITINERARY(itineraryId));
      const data = response.data;

      if (data.success) {
        set({
          currentItinerary: data.data.itinerary,
          isItineraryLoading: false,
          error: null
        });

        return { success: true, data: data.data.itinerary };
      } else {
        set({ error: data.message, isItineraryLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch itinerary';
      set({ error: errorMessage, isItineraryLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update itinerary rating
  updateItineraryRating: async (itineraryId, rating) => {
    try {
      const response = await api.put(ITINERARY_ROUTES.UPDATE_RATING(itineraryId), { rating });
      const data = response.data;

      if (data.success) {
        // Update in current itinerary if it matches
        const { currentItinerary, itineraries } = get();
        
        if (currentItinerary && currentItinerary.id === itineraryId) {
          set({
            currentItinerary: {
              ...currentItinerary,
              rating: data.data.rating
            }
          });
        }

        // Update in itineraries list
        const updatedItineraries = itineraries.map(itinerary =>
          itinerary.id === itineraryId 
            ? { ...itinerary, rating: data.data.rating }
            : itinerary
        );
        set({ itineraries: updatedItineraries });

        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update rating';
      return { success: false, error: errorMessage };
    }
  },

  // Update itinerary notes
  updateItineraryNotes: async (itineraryId, notes) => {
    try {
      const response = await api.put(ITINERARY_ROUTES.UPDATE_NOTES(itineraryId), { notes });
      const data = response.data;

      if (data.success) {
        // Update in current itinerary if it matches
        const { currentItinerary } = get();
        
        if (currentItinerary && currentItinerary.id === itineraryId) {
          set({
            currentItinerary: {
              ...currentItinerary,
              notes: data.data.notes
            }
          });
        }

        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update notes';
      return { success: false, error: errorMessage };
    }
  },

  // Delete itinerary
  deleteItinerary: async (itineraryId) => {
    try {
      const response = await api.delete(ITINERARY_ROUTES.DELETE_ITINERARY(itineraryId));
      const data = response.data;

      if (data.success) {
        // Remove from itineraries list
        const { itineraries, currentItinerary } = get();
        const updatedItineraries = itineraries.filter(itinerary => itinerary.id !== itineraryId);
        
        let newCurrentItinerary = currentItinerary;
        if (currentItinerary && currentItinerary.id === itineraryId) {
          newCurrentItinerary = null;
        }

        set({
          itineraries: updatedItineraries,
          currentItinerary: newCurrentItinerary
        });

        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete itinerary';
      return { success: false, error: errorMessage };
    }
  },

  // Get popular destinations
  getPopularDestinations: async () => {
    try {
      const response = await api.get(ITINERARY_ROUTES.POPULAR_DESTINATIONS);
      const data = response.data;

      if (data.success) {
        set({
          popularDestinations: data.data.destinations,
          error: null
        });

        return { success: true, data: data.data.destinations };
      } else {
        set({ error: data.message });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch popular destinations';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Initialize itinerary data
  initializeItineraries: async () => {
    const { getUserItineraries, getPopularDestinations } = get();
    
    try {
      await Promise.all([
        getUserItineraries(),
        getPopularDestinations()
      ]);
    } catch (error) {
      console.error('Error initializing itineraries:', error);
    }
  },

  // Clear all itinerary data (for logout)
  clearItineraryData: () => {
    set({
      itineraries: [],
      currentItinerary: null,
      popularDestinations: [],
      isItineraryLoading: false,
      isGenerating: false,
      error: null,
      pagination: null
    });
  }
});