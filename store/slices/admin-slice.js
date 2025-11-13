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
});
