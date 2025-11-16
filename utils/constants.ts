// API Configuration
import Constants from 'expo-constants';

export const HOST = Constants.expoConfig?.extra?.apiHost || 'http://localhost:5000';
// export const HOST = 'http://localhost:5000';
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

// Wanderlust Routes
export const WANDERLUST_ROUTES = {
    BASE: `${API_BASE_URL}/wanderlust`,
    GET_DESTINATIONS: `${API_BASE_URL}/wanderlust/destinations`,
    GET_TIP: `${API_BASE_URL}/wanderlust/tip`,
    GET_ALL_DESTINATIONS: `${API_BASE_URL}/wanderlust/destinations/all`,
    GET_ALL_TIPS: `${API_BASE_URL}/wanderlust/tips/all`,
    REGENERATE_CONTENT: `${API_BASE_URL}/wanderlust/regenerate`
};

// Itinerary Routes
export const ITINERARY_ROUTES = {
    BASE: `${API_BASE_URL}/itinerary`,
    GENERATE: `${API_BASE_URL}/itinerary/generate`,
    GET_USER_ITINERARIES: `${API_BASE_URL}/itinerary`,
    GET_ITINERARY: (id: string) => `${API_BASE_URL}/itinerary/${id}`,
    UPDATE_RATING: (id: string) => `${API_BASE_URL}/itinerary/${id}/rating`,
    UPDATE_NOTES: (id: string) => `${API_BASE_URL}/itinerary/${id}/notes`,
    DELETE_ITINERARY: (id: string) => `${API_BASE_URL}/itinerary/${id}`,
    POPULAR_DESTINATIONS: `${API_BASE_URL}/itinerary/popular-destinations`
};

// Message Routes
export const MESSAGE_ROUTES = {
    BASE: `${API_BASE_URL}/chats`,
    GET_CHATS: `${API_BASE_URL}/chats`,
    CREATE_CHAT: `${API_BASE_URL}/chats`,
    CREATE_GROUP: `${API_BASE_URL}/chats/group`,
    SEARCH_USERS: `${API_BASE_URL}/chats/search-users`,
    GET_CHAT: (chatId: string) => `${API_BASE_URL}/chats/${chatId}`,
    DELETE_CHAT: (chatId: string) => `${API_BASE_URL}/chats/${chatId}`,
    GET_MESSAGES: (chatId: string) => `${API_BASE_URL}/messages/${chatId}`,
    SEND_MESSAGE: (chatId: string) => `${API_BASE_URL}/messages/${chatId}`,
    MARK_READ: (chatId: string) => `${API_BASE_URL}/messages/${chatId}/read`,
    EDIT_MESSAGE: (messageId: string) => `${API_BASE_URL}/messages/edit/${messageId}`,
    DELETE_MESSAGE: (messageId: string) => `${API_BASE_URL}/messages/${messageId}`
};

// Query Routes
export const QUERY_ROUTES = {
    BASE: `${API_BASE_URL}/queries`,
    CREATE: `${API_BASE_URL}/queries`,
    MY_QUERIES: `${API_BASE_URL}/queries/my-queries`,
    GET_QUERY: (queryId: string) => `${API_BASE_URL}/queries/${queryId}`,
    ADMIN_ALL: `${API_BASE_URL}/queries/admin/all`,
    ADMIN_UPDATE_STATUS: (queryId: string) => `${API_BASE_URL}/queries/admin/${queryId}/status`,
    ADMIN_STATISTICS: `${API_BASE_URL}/queries/admin/statistics/overview`
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
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
};

// Admin Permissions
export const ADMIN_PERMISSIONS = {
    USER_MANAGEMENT: 'user_management',
    POST_MANAGEMENT: 'post_management',
    STORY_MANAGEMENT: 'story_management',
    QUERY_MANAGEMENT: 'query_management',
    ITINERARY_MANAGEMENT: 'itinerary_management',
    WANDERLUST_MANAGEMENT: 'wanderlust_management',
    EMAIL_MANAGEMENT: 'email_management',
    ADMIN_MANAGEMENT: 'admin_management',
    ANALYTICS_VIEW: 'analytics_view',
    SYSTEM_SETTINGS: 'system_settings',
    QUIZ_CONTEST_MANAGEMENT: 'quiz_contest_management',
    BUDDY_MANAGEMENT: 'buddy_management'
};

// Admin Routes
export const ADMIN_ROUTES = {
    BASE: `${API_BASE_URL}/admin`,
    DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    USERS: `${API_BASE_URL}/admin/users`,
    GET_USER: (userId: string) => `${API_BASE_URL}/admin/users/${userId}`,
    CREATE_USER: `${API_BASE_URL}/admin/users`,
    UPDATE_USER: (userId: string) => `${API_BASE_URL}/admin/users/${userId}`,
    DELETE_USER: (userId: string) => `${API_BASE_URL}/admin/users/${userId}`,
    CHANGE_ROLE: (userId: string) => `${API_BASE_URL}/admin/users/${userId}/role`,
    UPDATE_PERMISSIONS: (userId: string) => `${API_BASE_URL}/admin/users/${userId}/permissions`,
    POSTS: `${API_BASE_URL}/admin/posts`,
    DELETE_POST: (postId: string) => `${API_BASE_URL}/admin/posts/${postId}`,
    STORIES: `${API_BASE_URL}/admin/stories`,
    DELETE_STORY: (storyId: string) => `${API_BASE_URL}/admin/stories/${storyId}`,
    EXPORT_DATA: (type: string) => `${API_BASE_URL}/admin/export/${type}`,
    BROADCAST_EMAIL: `${API_BASE_URL}/admin/broadcast-email`,
    SYSTEM_HEALTH: `${API_BASE_URL}/admin/system-health`
};

// Quiz Routes
export const QUIZ_ROUTES = {
    // Admin
    ADMIN_CREATE: `${API_BASE_URL}/quiz/admin/create`,
    ADMIN_UPDATE: (quizId: string) => `${API_BASE_URL}/quiz/admin/${quizId}`,
    ADMIN_DELETE: (quizId: string) => `${API_BASE_URL}/quiz/admin/${quizId}`,
    ADMIN_ALL: `${API_BASE_URL}/quiz/admin/all`,
    ADMIN_GET: (quizId: string) => `${API_BASE_URL}/quiz/admin/${quizId}`,
    // User
    TODAY: `${API_BASE_URL}/quiz/today`,
    ATTEMPT: `${API_BASE_URL}/quiz/attempt`,
    MY_HISTORY: `${API_BASE_URL}/quiz/my-history`,
    CHECK_TODAY: `${API_BASE_URL}/quiz/check-today`,
};

// Contest Routes
export const CONTEST_ROUTES = {
    // Admin
    ADMIN_CREATE: `${API_BASE_URL}/contest/admin/create`,
    ADMIN_UPDATE: (contestId: string) => `${API_BASE_URL}/contest/admin/${contestId}`,
    ADMIN_DELETE: (contestId: string) => `${API_BASE_URL}/contest/admin/${contestId}`,
    ADMIN_ALL: `${API_BASE_URL}/contest/admin/all`,
    ADMIN_GET: (contestId: string) => `${API_BASE_URL}/contest/admin/${contestId}`,
    ADMIN_SUBMISSIONS: (contestId: string) => `${API_BASE_URL}/contest/admin/${contestId}/submissions`,
    ADMIN_STATS: (contestId: string) => `${API_BASE_URL}/contest/admin/${contestId}/stats`,
    ADMIN_REVIEW: (contestId: string, submissionId: string) => `${API_BASE_URL}/contest/admin/${contestId}/submissions/${submissionId}/review`,
    // User
    ACTIVE: `${API_BASE_URL}/contest/active`,
    GET: (contestId: string) => `${API_BASE_URL}/contest/${contestId}`,
    START: (contestId: string) => `${API_BASE_URL}/contest/${contestId}/start`,
    PROGRESS: (contestId: string) => `${API_BASE_URL}/contest/${contestId}/progress`,
    SUBMIT: (contestId: string) => `${API_BASE_URL}/contest/${contestId}/submit`,
    MY_HISTORY: `${API_BASE_URL}/contest/my/history`,
    // File Upload
    UPLOAD_TASK_PHOTO: `${API_BASE_URL}/contest/upload/task-photo`,
};

// Leaderboard Routes
export const LEADERBOARD_ROUTES = {
    DAILY: `${API_BASE_URL}/leaderboard/daily`,
    OVERALL: `${API_BASE_URL}/leaderboard/overall`,
    CONTEST: (contestId: string) => `${API_BASE_URL}/leaderboard/contest/${contestId}`,
    MY_RANK: `${API_BASE_URL}/leaderboard/my-rank`,
};

// Local Buddy Routes
export const BUDDY_ROUTES = {
    // User Routes
    REGISTER: `${API_BASE_URL}/buddy/register`,
    UPDATE_REGISTRATION: `${API_BASE_URL}/buddy/registration/update`,
    MY_PROFILE: `${API_BASE_URL}/buddy/my-profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/buddy/profile/update`,
    SEARCH: `${API_BASE_URL}/buddy/search`,
    GET_BUDDY: (buddyId: string) => `${API_BASE_URL}/buddy/${buddyId}`,
    
    // Booking Routes
    CREATE_BOOKING: `${API_BASE_URL}/buddy/booking/create`,
    CREATE_BOOKING_BY_BUDDY: `${API_BASE_URL}/buddy/booking/create-by-buddy`,
    RESPOND_BOOKING: (bookingId: string) => `${API_BASE_URL}/buddy/booking/${bookingId}/respond`,
    UPDATE_BOOKING_STATUS: (bookingId: string) => `${API_BASE_URL}/buddy/booking/${bookingId}/status`,
    RATE_BOOKING: (bookingId: string) => `${API_BASE_URL}/buddy/booking/${bookingId}/rate`,
    USER_BOOKING_HISTORY: `${API_BASE_URL}/buddy/booking/user/history`,
    BUDDY_BOOKING_HISTORY: `${API_BASE_URL}/buddy/booking/buddy/history`,
    GET_BOOKING: (bookingId: string) => `${API_BASE_URL}/buddy/booking/${bookingId}/details`,
    
    // Report
    REPORT_BUDDY: `${API_BASE_URL}/buddy/report`,
    
    // Admin Routes
    ADMIN_REGISTRATIONS: `${API_BASE_URL}/buddy/admin/registrations`,
    ADMIN_UPDATE_STATUS: (buddyId: string) => `${API_BASE_URL}/buddy/admin/${buddyId}/status`,
    ADMIN_BAN_BUDDY: (buddyId: string) => `${API_BASE_URL}/buddy/admin/${buddyId}/ban`,
    ADMIN_BOOKINGS: `${API_BASE_URL}/buddy/admin/bookings`,
    ADMIN_REPORTS: `${API_BASE_URL}/buddy/admin/reports`,
    ADMIN_UPDATE_REPORT: (reportId: string) => `${API_BASE_URL}/buddy/admin/reports/${reportId}`,
    ADMIN_STATISTICS: `${API_BASE_URL}/buddy/admin/statistics`,
};

// Budget Categories
export const BUDGET_CATEGORIES = [
  { category: 'Accommodation', icon: 'bed', color: '#3B82F6' },
  { category: 'Transportation', icon: 'airplane', color: '#10B981' },
  { category: 'Food & Dining', icon: 'restaurant', color: '#F59E0B' },
  { category: 'Activities', icon: 'camera', color: '#8B5CF6' },
  { category: 'Shopping', icon: 'bag', color: '#EF4444' },
  { category: 'Miscellaneous', icon: 'card', color: '#6B7280' }
];

// Travel Tips
export const TRAVEL_TIPS = [
    { tip: "🎒 Pack light, travel far", author: "Every seasoned traveler" },
    { tip: "📸 Capture moments, not just photos", author: "The mindful explorer" },
    { tip: "🗺️ Get lost to find yourself", author: "Ancient travel wisdom" },
    { tip: "🌅 Early bird catches the sunrise", author: "Nature's photographer" },
    { tip: "🌍 The world is a book, read every page", author: "Saint Augustine" },
    { tip: "✈️ Adventure is worthwhile in itself", author: "Amelia Earhart" },
    { tip: "🏔️ Mountains know secrets we need to learn", author: "The wise wanderer" },
    { tip: "🌊 Let the waves wash your worries away", author: "Coastal philosophy" },
    { tip: "🚂 The journey matters more than the destination", author: "Ralph Waldo Emerson" },
    { tip: "🎯 Travel makes one modest, you see what a tiny place you occupy", author: "Gustave Flaubert" },
    { tip: "🌟 Collect moments, not things", author: "Modern nomad" },
    { tip: "🗝️ Travel is the only thing you buy that makes you richer", author: "Anonymous" },
    { tip: "🌈 Life is short and the world is wide", author: "Simon Raven" },
    { tip: "🧭 Not all those who wander are lost", author: "J.R.R. Tolkien" },
    { tip: "🎭 Travel far enough, you meet yourself", author: "David Mitchell" }
];