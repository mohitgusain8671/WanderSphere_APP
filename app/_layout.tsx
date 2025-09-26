import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import { useAppStore } from '../store';

import { setupDeepLinkHandling } from '../utils/deeplink';
import './global.css';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isThemeLoading, initializeAuth } = useAppStore();
  const { showSuccess, showError } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setIsMounted(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Setup deep link handling
      const subscription = setupDeepLinkHandling(showSuccess, showError);
      return () => subscription?.remove();
    }
  }, [isMounted, showSuccess, showError]);

  useEffect(() => {
    if (isMounted && !isLoading && !isThemeLoading) {
      // Use setTimeout to ensure navigation happens after component is fully mounted
      setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 100);
    }
  }, [isAuthenticated, isLoading, isThemeLoading, isMounted]);

  if (!isMounted || isLoading || isThemeLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#ffffff' // Use a static color to prevent blinking
      }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthWrapper>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthWrapper>
      </ToastProvider>
    </ThemeProvider>
  );
}
