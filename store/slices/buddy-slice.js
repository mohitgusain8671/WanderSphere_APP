import api from '../../utils/api';
import { BUDDY_ROUTES } from '../../utils/constants';

export const createBuddySlice = (set, get) => ({
  // Buddy State
  myBuddyProfile: null,
  buddies: [],
  selectedBuddy: null,
  userBookings: [],
  buddyBookings: [],
  selectedBooking: null,
  isBuddyLoading: false,
  buddyError: null,
  buddyPagination: null,
  bookingPagination: null,

  // Actions
  setBuddyError: (error) => set({ buddyError: error }),
  clearBuddyError: () => set({ buddyError: null }),

  // Register as Buddy
  registerAsBuddy: async (buddyData) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.post(BUDDY_ROUTES.REGISTER, buddyData);
      
      if (response.data.success) {
        set({
          myBuddyProfile: response.data.data.buddy,
          isBuddyLoading: false,
        });
        return { success: true, data: response.data.data.buddy, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to register as buddy';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update Buddy Registration
  updateBuddyRegistration: async (updates) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.put(BUDDY_ROUTES.UPDATE_REGISTRATION, updates);
      
      if (response.data.success) {
        set({
          myBuddyProfile: response.data.data.buddy,
          isBuddyLoading: false,
        });
        return { success: true, data: response.data.data.buddy, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update registration';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get My Buddy Profile
  getMyBuddyProfile: async () => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.get(BUDDY_ROUTES.MY_PROFILE);
      
      if (response.data.success) {
        set({
          myBuddyProfile: response.data.data.buddy,
          isBuddyLoading: false,
        });
        return { success: true, data: response.data.data.buddy };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch buddy profile';
      set({ buddyError: errorMessage, isBuddyLoading: false, myBuddyProfile: null });
      return { success: false, error: errorMessage };
    }
  },

  // Update Buddy Profile
  updateBuddyProfile: async (updates) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.put(BUDDY_ROUTES.UPDATE_PROFILE, updates);
      
      if (response.data.success) {
        set({
          myBuddyProfile: response.data.data.buddy,
          isBuddyLoading: false,
        });
        return { success: true, data: response.data.data.buddy, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Search Buddies
  searchBuddies: async (filters = {}) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`${BUDDY_ROUTES.SEARCH}?${params}`);
      
      if (response.data.success) {
        set({
          buddies: response.data.data.buddies,
          buddyPagination: response.data.data.pagination,
          isBuddyLoading: false,
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to search buddies';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get Buddy by ID
  getBuddyById: async (buddyId) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.get(BUDDY_ROUTES.GET_BUDDY(buddyId));
      
      if (response.data.success) {
        set({
          selectedBuddy: response.data.data,
          isBuddyLoading: false,
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch buddy details';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Create Booking Request
  createBookingRequest: async (bookingData) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.post(BUDDY_ROUTES.CREATE_BOOKING, bookingData);
      
      if (response.data.success) {
        set({ isBuddyLoading: false });
        return { success: true, data: response.data.data.booking, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Create Booking by Buddy
  createBookingByBuddy: async (bookingData) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.post(BUDDY_ROUTES.CREATE_BOOKING_BY_BUDDY, bookingData);
      
      if (response.data.success) {
        set({ isBuddyLoading: false });
        return { success: true, data: response.data.data.booking, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Respond to Booking
  respondToBooking: async (bookingId, action, message) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.put(BUDDY_ROUTES.RESPOND_BOOKING(bookingId), { action, message });
      
      if (response.data.success) {
        set({ isBuddyLoading: false });
        // Refresh buddy bookings
        await get().getBuddyBookingHistory();
        return { success: true, data: response.data.data.booking, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to respond to booking';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update Booking Status
  updateBookingStatus: async (bookingId, status) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.put(BUDDY_ROUTES.UPDATE_BOOKING_STATUS(bookingId), { status });
      
      if (response.data.success) {
        set({ isBuddyLoading: false });
        return { success: true, data: response.data.data.booking, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update booking status';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Rate Booking
  rateBooking: async (bookingId, rating, review) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.post(BUDDY_ROUTES.RATE_BOOKING(bookingId), { rating, review });
      
      if (response.data.success) {
        set({ isBuddyLoading: false });
        // Refresh user bookings
        await get().getUserBookingHistory();
        return { success: true, data: response.data.data.booking, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit rating';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get User Booking History
  getUserBookingHistory: async (filters = {}) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`${BUDDY_ROUTES.USER_BOOKING_HISTORY}?${params}`);
      
      if (response.data.success) {
        set({
          userBookings: response.data.data.bookings,
          bookingPagination: response.data.data.pagination,
          isBuddyLoading: false,
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch booking history';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get Buddy Booking History
  getBuddyBookingHistory: async (filters = {}) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`${BUDDY_ROUTES.BUDDY_BOOKING_HISTORY}?${params}`);
      
      if (response.data.success) {
        set({
          buddyBookings: response.data.data.bookings,
          bookingPagination: response.data.data.pagination,
          isBuddyLoading: false,
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch booking history';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get Booking by ID
  getBookingById: async (bookingId) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.get(BUDDY_ROUTES.GET_BOOKING(bookingId));
      
      if (response.data.success) {
        set({
          selectedBooking: response.data.data.booking,
          isBuddyLoading: false,
        });
        return { success: true, data: response.data.data.booking };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch booking details';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Report Buddy
  reportBuddy: async (reportData) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const response = await api.post(BUDDY_ROUTES.REPORT_BUDDY, reportData);
      
      if (response.data.success) {
        set({ isBuddyLoading: false });
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit report';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Upload Buddy Documents
  uploadBuddyDocuments: async (documents) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const formData = new FormData();
      documents.forEach((doc, index) => {
        formData.append('documents', {
          uri: doc.uri,
          type: doc.type || 'application/pdf',
          name: doc.name || `document_${index}.pdf`,
        });
      });

      const response = await api.post(BUDDY_ROUTES.UPLOAD_DOCUMENTS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        set({ isBuddyLoading: false });
        return { success: true, data: response.data.data, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload documents';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Upload Buddy Profile Picture
  uploadBuddyProfilePicture: async (imageUri) => {
    set({ isBuddyLoading: true, buddyError: null });
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile_picture.jpg',
      });

      const response = await api.post(BUDDY_ROUTES.UPLOAD_PROFILE_PICTURE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        set({ isBuddyLoading: false });
        return { success: true, data: response.data.data, message: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload profile picture';
      set({ buddyError: errorMessage, isBuddyLoading: false });
      return { success: false, error: errorMessage };
    }
  },
});
