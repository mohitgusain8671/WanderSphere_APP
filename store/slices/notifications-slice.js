import api from '../../utils/api';
import { NOTIFICATIONS_ROUTES } from '../../utils/constants';

export const createNotificationsSlice = (set, get) => ({
  // Notifications State
  notifications: [],
  unreadCount: 0,
  isNotificationLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  // Actions
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setIsNotificationLoading: (isNotificationLoading) => set({ isNotificationLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setHasMore: (hasMore) => set({ hasMore }),
  setCurrentPage: (page) => set({ currentPage: page }),

  // Get notifications
  getNotifications: async (page = 1, unreadOnly = false) => {
    const { currentPage, notifications } = get();
    
    // If it's page 1, show loading and reset notifications
    if (page === 1) {
      set({ isNotificationLoading: true, error: null, notifications: [], currentPage: 1 });
    }

    try {
      const params = {
        page,
        limit: 20,
        unreadOnly
      };

      const response = await api.get(NOTIFICATIONS_ROUTES.GET_NOTIFICATIONS, { params });
      const data = response.data;

      if (data.success) {
        const newNotifications = data.data.notifications;
        const pagination = data.data.pagination;

        // If it's page 1, replace notifications; otherwise append
        const updatedNotifications = page === 1 ? newNotifications : [...notifications, ...newNotifications];

        set({
          notifications: updatedNotifications,
          unreadCount: data.data.unreadCount,
          hasMore: pagination.hasMore,
          currentPage: page,
          isNotificationLoading: false,
          error: null
        });

        return { success: true, data: newNotifications };
      } else {
        set({ error: data.message, isNotificationLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch notifications';
      set({ error: errorMessage, isNotificationLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Load more notifications (infinite scroll)
  loadMoreNotifications: async (unreadOnly = false) => {
    const { currentPage, hasMore, isNotificationLoading } = get();
    
    if (!hasMore || isNotificationLoading) return;

    return await get().getNotifications(currentPage + 1, unreadOnly);
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get(NOTIFICATIONS_ROUTES.GET_UNREAD_COUNT);
      const data = response.data;

      if (data.success) {
        set({ unreadCount: data.data.unreadCount });
        return { success: true, data: data.data.unreadCount };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch unread count';
      return { success: false, error: errorMessage };
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.put(NOTIFICATIONS_ROUTES.MARK_AS_READ(notificationId));
      const data = response.data;

      if (data.success) {
        // Update the notification in the notifications array
        const { notifications, unreadCount } = get();
        const updatedNotifications = notifications.map(notification => {
          if (notification._id === notificationId && !notification.isRead) {
            return { ...notification, isRead: true };
          }
          return notification;
        });

        // Decrease unread count if notification was unread
        const wasUnread = notifications.find(n => n._id === notificationId && !n.isRead);
        const newUnreadCount = wasUnread ? Math.max(0, unreadCount - 1) : unreadCount;

        set({
          notifications: updatedNotifications,
          unreadCount: newUnreadCount
        });

        return { success: true, data: data.data.notification };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to mark notification as read';
      return { success: false, error: errorMessage };
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    set({ isNotificationLoading: true, error: null });

    try {
      const response = await api.put(NOTIFICATIONS_ROUTES.MARK_ALL_READ);
      const data = response.data;

      if (data.success) {
        // Mark all notifications as read
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          isRead: true
        }));

        set({
          notifications: updatedNotifications,
          unreadCount: 0,
          isNotificationLoading: false,
          error: null
        });

        return { success: true };
      } else {
        set({ error: data.message, isNotificationLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to mark all notifications as read';
      set({ error: errorMessage, isNotificationLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(NOTIFICATIONS_ROUTES.DELETE_NOTIFICATION(notificationId));
      const data = response.data;

      if (data.success) {
        // Remove the notification from the notifications array
        const { notifications, unreadCount } = get();
        const notificationToDelete = notifications.find(n => n._id === notificationId);
        const updatedNotifications = notifications.filter(notification => notification._id !== notificationId);

        // Decrease unread count if deleted notification was unread
        const newUnreadCount = notificationToDelete && !notificationToDelete.isRead 
          ? Math.max(0, unreadCount - 1) 
          : unreadCount;

        set({
          notifications: updatedNotifications,
          unreadCount: newUnreadCount
        });

        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete notification';
      return { success: false, error: errorMessage };
    }
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    set({ isNotificationLoading: true, error: null });

    try {
      const response = await api.delete(NOTIFICATIONS_ROUTES.CLEAR_ALL);
      const data = response.data;

      if (data.success) {
        set({
          notifications: [],
          unreadCount: 0,
          isNotificationLoading: false,
          error: null
        });

        return { success: true };
      } else {
        set({ error: data.message, isNotificationLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear all notifications';
      set({ error: errorMessage, isNotificationLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Add new notification (for real-time updates)
  addNotification: (notification) => {
    const { notifications, unreadCount } = get();
    set({
      notifications: [notification, ...notifications],
      unreadCount: unreadCount + 1
    });
  },

  // Update notification (for real-time updates)
  updateNotification: (notificationId, updates) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(notification => {
      if (notification._id === notificationId) {
        return { ...notification, ...updates };
      }
      return notification;
    });

    set({ notifications: updatedNotifications });
  },

  // Clear notifications (for logout)
  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      isNotificationLoading: false,
      error: null,
      hasMore: true,
      currentPage: 1
    });
  }
});