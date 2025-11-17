import api from '../../utils/api';
import { ADMIN_ROUTES } from '../../utils/constants';

export const createAdminSlice = (set, get) => ({
  // Dashboard State
  dashboardData: null,
  isAdminDashboardLoading: false,
  dashboardError: null,

  // Users State
  adminUsers: [],
  isAdminUsersLoading: false,
  usersError: null,
  usersPagination: null,
  selectedUser: null,

  // Posts State
  adminPosts: [],
  isAdminPostsLoading: false,
  postsError: null,
  postsPagination: null,

  // Stories State
  adminStories: [],
  isAdminStoriesLoading: false,
  storiesError: null,
  storiesPagination: null,

  // System Health
  systemHealth: null,

  // Get Dashboard Analytics
  getDashboardAnalytics: async () => {
    set({ isAdminDashboardLoading: true, dashboardError: null });
    try {
      const response = await api.get(ADMIN_ROUTES.DASHBOARD);
      const data = response.data;
      
      set({ dashboardData: data, isAdminDashboardLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch dashboard analytics';
      set({ dashboardError: errorMsg, isAdminDashboardLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get All Users
  getAllUsers: async (filters = {}) => {
    set({ isAdminUsersLoading: true, usersError: null });
    try {
      const response = await api.get(ADMIN_ROUTES.USERS, { params: filters });
      const data = response.data;
      
      set({ 
        adminUsers: data.users, 
        usersPagination: data.pagination,
        isAdminUsersLoading: false 
      });
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch users';
      set({ usersError: errorMsg, isAdminUsersLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get User by ID
  getUserById: async (userId) => {
    set({ isAdminUsersLoading: true, usersError: null });
    try {
      const response = await api.get(ADMIN_ROUTES.GET_USER(userId));
      const data = response.data;
      
      set({ selectedUser: data, isAdminUsersLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch user';
      set({ usersError: errorMsg, isAdminUsersLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Create User
  createUser: async (userData) => {
    set({ isAdminUsersLoading: true, usersError: null });
    try {
      const response = await api.post(ADMIN_ROUTES.CREATE_USER, userData);
      const data = response.data;
      
      // Refresh users list
      await get().getAllUsers();
      
      set({ isAdminUsersLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create user';
      set({ usersError: errorMsg, isAdminUsersLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Update User
  updateUser: async (userId, updates) => {
    set({ isAdminUsersLoading: true, usersError: null });
    try {
      const response = await api.put(ADMIN_ROUTES.UPDATE_USER(userId), updates);
      const data = response.data;
      
      // Update user in list
      set(state => ({
        adminUsers: state.adminUsers.map(user => 
          user._id === userId ? data.user : user
        ),
        isAdminUsersLoading: false
      }));
      
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update user';
      set({ usersError: errorMsg, isAdminUsersLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Delete User
  deleteUser: async (userId) => {
    set({ isAdminUsersLoading: true, usersError: null });
    try {
      await api.delete(ADMIN_ROUTES.DELETE_USER(userId));
      
      // Remove user from list
      set(state => ({
        adminUsers: state.adminUsers.filter(user => user._id !== userId),
        isAdminUsersLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete user';
      set({ usersError: errorMsg, isAdminUsersLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Change User Role (Super Admin Only)
  changeUserRole: async (userId, role, permissions = []) => {
    set({ isAdminUsersLoading: true, usersError: null });
    try {
      const response = await api.put(ADMIN_ROUTES.CHANGE_ROLE(userId), { role, permissions });
      const data = response.data;
      
      // Update user in list
      set(state => ({
        adminUsers: state.adminUsers.map(user => 
          user._id === userId ? data.user : user
        ),
        isAdminUsersLoading: false
      }));
      
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to change user role';
      set({ usersError: errorMsg, isAdminUsersLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Update User Permissions (Super Admin Only)
  updateUserPermissions: async (userId, permissions) => {
    set({ isAdminUsersLoading: true, usersError: null });
    try {
      const response = await api.put(ADMIN_ROUTES.UPDATE_PERMISSIONS(userId), { permissions });
      const data = response.data;
      
      // Update user in list
      set(state => ({
        adminUsers: state.adminUsers.map(user => 
          user._id === userId ? data.user : user
        ),
        isAdminUsersLoading: false
      }));
      
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update permissions';
      set({ usersError: errorMsg, isAdminUsersLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get All Posts
  getAllPosts: async (filters = {}) => {
    set({ isAdminPostsLoading: true, postsError: null });
    try {
      const response = await api.get(ADMIN_ROUTES.POSTS, { params: filters });
      const data = response.data;
      
      set({ 
        adminPosts: data.posts, 
        postsPagination: data.pagination,
        isAdminPostsLoading: false 
      });
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch posts';
      set({ postsError: errorMsg, isAdminPostsLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Delete Post
  deletePost: async (postId) => {
    set({ isAdminPostsLoading: true, postsError: null });
    try {
      await api.delete(ADMIN_ROUTES.DELETE_POST(postId));
      
      // Remove post from list
      set(state => ({
        adminPosts: state.adminPosts.filter(post => post._id !== postId),
        isAdminPostsLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete post';
      set({ postsError: errorMsg, isAdminPostsLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get All Stories
  getAllStories: async (filters = {}) => {
    set({ isAdminStoriesLoading: true, storiesError: null });
    try {
      const response = await api.get(ADMIN_ROUTES.STORIES, { params: filters });
      const data = response.data;
      
      set({ 
        adminStories: data.stories, 
        storiesPagination: data.pagination,
        isAdminStoriesLoading: false 
      });
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch stories';
      set({ storiesError: errorMsg, isAdminStoriesLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Delete Story
  deleteStory: async (storyId) => {
    set({ isAdminStoriesLoading: true, storiesError: null });
    try {
      await api.delete(ADMIN_ROUTES.DELETE_STORY(storyId));
      
      // Remove story from list
      set(state => ({
        adminStories: state.adminStories.filter(story => story._id !== storyId),
        isAdminStoriesLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete story';
      set({ storiesError: errorMsg, isAdminStoriesLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Export Data
  exportData: async (type) => {
    try {
      const response = await api.get(ADMIN_ROUTES.EXPORT_DATA(type));
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to export data';
      return { success: false, error: errorMsg };
    }
  },

  // Send Broadcast Email
  sendBroadcastEmail: async (emailData) => {
    try {
      const response = await api.post(ADMIN_ROUTES.BROADCAST_EMAIL, emailData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send broadcast email';
      return { success: false, error: errorMsg };
    }
  },

  // Get System Health
  getSystemHealth: async () => {
    try {
      const response = await api.get(ADMIN_ROUTES.SYSTEM_HEALTH);
      set({ systemHealth: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch system health';
      return { success: false, error: errorMsg };
    }
  },

  // Clear Admin State
  clearAdminState: () => {
    set({
      dashboardData: null,
      adminUsers: [],
      adminPosts: [],
      adminStories: [],
      selectedUser: null,
      systemHealth: null,
    });
  },

  // ==================== BUDDY MANAGEMENT ====================
  
  // Buddy State
  adminBuddies: [],
  isAdminBuddiesLoading: false,
  buddiesError: null,
  buddiesPagination: null,
  
  adminBookings: [],
  isAdminBookingsLoading: false,
  bookingsError: null,
  bookingsPagination: null,
  
  adminReports: [],
  isAdminReportsLoading: false,
  reportsError: null,
  reportsPagination: null,
  
  buddyStatistics: null,

  // Get All Buddy Registrations
  getAllBuddyRegistrations: async (filters = {}) => {
    set({ isAdminBuddiesLoading: true, buddiesError: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`${require('../../utils/constants').BUDDY_ROUTES.ADMIN_REGISTRATIONS}?${params}`);
      
      if (response.data.success) {
        set({
          adminBuddies: response.data.data.buddies,
          buddiesPagination: response.data.data.pagination,
          isAdminBuddiesLoading: false,
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch buddy registrations';
      set({ buddiesError: errorMsg, isAdminBuddiesLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Update Buddy Status (Approve/Reject)
  updateBuddyStatus: async (buddyId, status, rejectionReason = '') => {
    set({ isAdminBuddiesLoading: true, buddiesError: null });
    try {
      const response = await api.put(
        require('../../utils/constants').BUDDY_ROUTES.ADMIN_UPDATE_STATUS(buddyId),
        { status, rejectionReason }
      );
      
      if (response.data.success) {
        // Update buddy in list
        set(state => ({
          adminBuddies: state.adminBuddies.map(buddy =>
            buddy._id === buddyId ? response.data.data.buddy : buddy
          ),
          isAdminBuddiesLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update buddy status';
      set({ buddiesError: errorMsg, isAdminBuddiesLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Ban/Unban Buddy
  banBuddy: async (buddyId, action, reason = '') => {
    set({ isAdminBuddiesLoading: true, buddiesError: null });
    try {
      const response = await api.put(
        require('../../utils/constants').BUDDY_ROUTES.ADMIN_BAN_BUDDY(buddyId),
        { action, reason }
      );
      
      if (response.data.success) {
        // Update buddy in list
        set(state => ({
          adminBuddies: state.adminBuddies.map(buddy =>
            buddy._id === buddyId ? response.data.data.buddy : buddy
          ),
          isAdminBuddiesLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to ban/unban buddy';
      set({ buddiesError: errorMsg, isAdminBuddiesLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get All Bookings
  getAllBookings: async (filters = {}) => {
    set({ isAdminBookingsLoading: true, bookingsError: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`${require('../../utils/constants').BUDDY_ROUTES.ADMIN_BOOKINGS}?${params}`);
      
      if (response.data.success) {
        set({
          adminBookings: response.data.data.bookings,
          bookingsPagination: response.data.data.pagination,
          isAdminBookingsLoading: false,
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch bookings';
      set({ bookingsError: errorMsg, isAdminBookingsLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get All Reports
  getAllReports: async (filters = {}) => {
    set({ isAdminReportsLoading: true, reportsError: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`${require('../../utils/constants').BUDDY_ROUTES.ADMIN_REPORTS}?${params}`);
      
      if (response.data.success) {
        set({
          adminReports: response.data.data.reports,
          reportsPagination: response.data.data.pagination,
          isAdminReportsLoading: false,
        });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch reports';
      set({ reportsError: errorMsg, isAdminReportsLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Update Report Status
  updateReportStatus: async (reportId, status, adminNotes = '', actionTaken = 'none') => {
    set({ isAdminReportsLoading: true, reportsError: null });
    try {
      const response = await api.put(
        require('../../utils/constants').BUDDY_ROUTES.ADMIN_UPDATE_REPORT(reportId),
        { status, adminNotes, actionTaken }
      );
      
      if (response.data.success) {
        // Update report in list
        set(state => ({
          adminReports: state.adminReports.map(report =>
            report._id === reportId ? response.data.data.report : report
          ),
          isAdminReportsLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update report';
      set({ reportsError: errorMsg, isAdminReportsLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get Buddy Statistics
  getBuddyStatistics: async () => {
    try {
      const response = await api.get(require('../../utils/constants').BUDDY_ROUTES.ADMIN_STATISTICS);
      
      if (response.data.success) {
        set({ buddyStatistics: response.data.data });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch buddy statistics';
      return { success: false, error: errorMsg };
    }
  },
});
