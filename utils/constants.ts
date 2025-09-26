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