import React, { createContext, useContext, useEffect } from 'react';
import { useAppStore } from '../store';
import { COLORS } from '../utils/constants';

interface ThemeContextType {
  isDarkMode: boolean;
  colors: typeof COLORS.light;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, isThemeLoading, toggleTheme, initializeTheme } = useAppStore();

  useEffect(() => {
    initializeTheme();
  }, []);

  // Don't render children until theme is loaded to prevent blinking
  if (isThemeLoading) {
    return null;
  }

  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const value = {
    isDarkMode,
    colors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};