// API Configuration
export const HOST = process.env.EXPO_PUBLIC_API_HOST || 'http://localhost:5000';
export const API_BASE_URL = `${HOST}/api`;

export const AUTH_ROUTES = {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    LOGOUT: `${API_BASE_URL}/auth/logout`
};

// Posts Routes
export const POSTS_ROUTES = {
    BASE: `${API_BASE_URL}/posts`,
    GET_POSTS: `${API_BASE_URL}/posts`,
    CREATE_POST: `${API_BASE_URL}/posts`,
    GET_POST: (postId: string) => `${API_BASE_URL}/posts/${postId}`,
    UPDATE_POST: (postId: string) => `${API_BASE_URL}/posts/${postId}`,
    DELETE_POST: (postId: string) => `${API_BASE_URL}/posts/${postId}`,
    TOGGLE_LIKE: (postId: string) => `${API_BASE_URL}/posts/${postId}/like`,
    ADD_COMMENT: (postId: string) => `${API_BASE_URL}/posts/${postId}/comments`,
    GET_COMMENTS: (postId: string) => `${API_BASE_URL}/posts/${postId}/comments`
};

// Friends Routes
export const FRIENDS_ROUTES = {
    BASE: `${API_BASE_URL}/friends`,
    SEND_REQUEST: `${API_BASE_URL}/friends/request`,
    RESPOND_REQUEST: (friendshipId: string) => `${API_BASE_URL}/friends/request/${friendshipId}`,
    GET_REQUESTS: `${API_BASE_URL}/friends/requests`,
    GET_SENT_REQUESTS: `${API_BASE_URL}/friends/requests/sent`,
    GET_FRIENDS: `${API_BASE_URL}/friends`,
    REMOVE_FRIEND: (friendId: string) => `${API_BASE_URL}/friends/${friendId}`,
    SEARCH_USERS: `${API_BASE_URL}/friends/search`,
    GET_FRIENDSHIP_STATUS: (userId: string) => `${API_BASE_URL}/friends/status/${userId}`
};

// Stories Routes
export const STORIES_ROUTES = {
    BASE: `${API_BASE_URL}/stories`,
    CREATE_STORY: `${API_BASE_URL}/stories`,
    GET_STORIES: `${API_BASE_URL}/stories`,
    GET_MY_STORIES: `${API_BASE_URL}/stories/my`,
    GET_USER_STORIES: (userId: string) => `${API_BASE_URL}/stories/user/${userId}`,
    GET_STORY: (storyId: string) => `${API_BASE_URL}/stories/${storyId}`,
    DELETE_STORY: (storyId: string) => `${API_BASE_URL}/stories/${storyId}`,
    TOGGLE_LIKE: (storyId: string) => `${API_BASE_URL}/stories/${storyId}/like`,
    GET_VIEWERS: (storyId: string) => `${API_BASE_URL}/stories/${storyId}/viewers`
};

// Notifications Routes
export const NOTIFICATIONS_ROUTES = {
    BASE: `${API_BASE_URL}/notifications`,
    GET_NOTIFICATIONS: `${API_BASE_URL}/notifications`,
    GET_UNREAD_COUNT: `${API_BASE_URL}/notifications/unread-count`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read`,
    CLEAR_ALL: `${API_BASE_URL}/notifications/clear-all`,
    MARK_AS_READ: (notificationId: string) => `${API_BASE_URL}/notifications/${notificationId}/read`,
    DELETE_NOTIFICATION: (notificationId: string) => `${API_BASE_URL}/notifications/${notificationId}`
};

// User Routes
export const USER_ROUTES = {
    BASE: `${API_BASE_URL}/users`,
    GET_PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    UPLOAD_PROFILE_PICTURE: `${API_BASE_URL}/users/profile/picture`,
    REMOVE_PROFILE_PICTURE: `${API_BASE_URL}/users/profile/picture`,
    GET_USER: (userId: string) => `${API_BASE_URL}/users/${userId}`,
    SEARCH_USERS: `${API_BASE_URL}/users/search/users`
};

// App Configuration
export const APP_NAME = 'WanderSphere';

// Theme Colors
export const COLORS = {
    primary: '#3B82F6', // Blue
    secondary: '#10B981', // Green
    accent: '#F59E0B', // Amber
    danger: '#EF4444', // Red
    warning: '#F59E0B', // Amber
    success: '#10B981', // Green
    
    // Light Theme
    light: {
        background: '#FFFFFF',
        surface: '#F8FAFC',
        card: '#FFFFFF',
        text: '#1F2937',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        input: '#F9FAFB'
    },
    
    // Dark Theme
    dark: {
        background: '#0F172A',
        surface: '#1E293B',
        card: '#334155',
        text: '#F1F5F9',
        textSecondary: '#94A3B8',
        border: '#475569',
        input: '#334155'
    }
};

// Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_INFO: 'user_info',
    THEME: 'theme_preference'
};

// User Roles
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};