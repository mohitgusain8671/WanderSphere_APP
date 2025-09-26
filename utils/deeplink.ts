import * as Linking from 'expo-linking';
import { router } from 'expo-router';

export interface EmailVerificationParams {
  success: string;
  message?: string;
  error?: string;
}

export const handleEmailVerificationDeepLink = (url: string) => {
  const { hostname, queryParams } = Linking.parse(url);
  
  if (hostname === 'email-verified') {
    const params = queryParams as EmailVerificationParams | null;
    
    if (params?.success === 'true') {
      // Show success message and redirect to login
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
      
      return {
        success: true,
        message: params.message || 'Email verified successfully! You can now login.'
      };
    } else {
      // Show error message
      return {
        success: false,
        error: params?.error || 'Email verification failed'
      };
    }
  }
  
  return null;
};

export const setupDeepLinkHandling = (showSuccess: (message: string) => void, showError: (message: string) => void) => {
  // Handle initial URL if app was opened via deep link
  Linking.getInitialURL().then((url) => {
    if (url) {
      const result = handleEmailVerificationDeepLink(url);
      if (result) {
        if (result.success) {
          showSuccess(result.message!);
        } else {
          showError(result.error!);
        }
      }
    }
  });

  // Handle deep links when app is already running
  const subscription = Linking.addEventListener('url', ({ url }) => {
    const result = handleEmailVerificationDeepLink(url);
    if (result) {
      if (result.success) {
        showSuccess(result.message!);
      } else {
        showError(result.error!);
      }
    }
  });

  return subscription;
};