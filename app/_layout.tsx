import React, { useEffect, useState } from 'react';
import { Stack, router, Slot } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import { useAppStore } from '../store';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { setupDeepLinkHandling } from '../utils/deeplink';
import './global.css';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initializeAuth } = useAppStore();
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
    if (isMounted && !isLoading) {
      // Use setTimeout to ensure navigation happens after component is fully mounted
      setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 100);
    }
  }, [isAuthenticated, isLoading, isMounted]);

  if (!isMounted || isLoading) {
    return <LoadingSpinner fullScreen />;
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
