import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../../utils/constants';

export const createThemeSlice = (set, get) => ({
    // Theme State
    isDarkMode: false,
    isThemeLoading: true,
    
    // Actions
    setTheme: (isDarkMode) => set({ isDarkMode }),
    
    toggleTheme: async () => {
        const currentTheme = get().isDarkMode;
        const newTheme = !currentTheme;
        
        try {
            await SecureStore.setItemAsync(STORAGE_KEYS.THEME, newTheme.toString());
            set({ isDarkMode: newTheme });
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    },
    
    initializeTheme: async () => {
        try {
            const savedTheme = await SecureStore.getItemAsync(STORAGE_KEYS.THEME);
            if (savedTheme !== null) {
                set({ isDarkMode: savedTheme === 'true', isThemeLoading: false });
            } else {
                set({ isThemeLoading: false });
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
            set({ isThemeLoading: false });
        }
    }
});