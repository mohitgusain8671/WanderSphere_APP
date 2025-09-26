import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { validateOTP, validateForm } from '../../utils/validation';

export default function ResetPasswordScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { resetPassword, isLoading, error, clearError } = useAppStore();
  const { showSuccess, showError } = useToast();
  const params = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    userId: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [userEmail, setUserEmail] = useState('');

  // Set userId and email from params when component mounts
  useEffect(() => {
    if (params.userId && params.email) {
      setFormData(prev => ({ ...prev, userId: params.userId as string }));
      setUserEmail(params.email as string);
    } else {
      // If no params, redirect back to forgot password
      showError('Please request a password reset first.');
      setTimeout(() => {
        router.replace('/(auth)/forgot-password');
      }, 2000);
    }
  }, [params]);

  const validateFormData = () => {
    const validationRules = {
      otp: (value: string) => validateOTP(value),
      newPassword: (value: string) => {
        if (!value.trim()) return 'New password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      confirmPassword: (value: string) => {
        if (!value.trim()) return 'Please confirm your password';
        if (value !== formData.newPassword) return 'Passwords do not match';
        return null;
      }
    };

    // Check if userId is available (should be set from params)
    if (!formData.userId.trim()) {
      showError('Session expired. Please request a new password reset.');
      return false;
    }

    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleResetPassword = async () => {
    clearError();
    
    if (!validateFormData()) return;

    const result = await resetPassword({
      userId: formData.userId.trim(),
      otp: formData.otp.trim(),
      newPassword: formData.newPassword
    });

    if (result.success) {
      showSuccess(
        'Password reset successful! You can now login with your new password.',
        5000
      );
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    } else {
      showError(result.error || 'Password reset failed. Please try again.');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 pb-8">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleTheme}
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons 
              name={isDarkMode ? 'sunny' : 'moon'} 
              size={24} 
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Text 
            className="text-3xl font-bold"
            style={{ color: colors.text }}
          >
            Reset Password
          </Text>
          <Text 
            className="text-lg mt-1"
            style={{ color: colors.textSecondary }}
          >
            Enter the OTP and create a new password
          </Text>
        </View>

        {/* Key Icon */}
        <View className="items-center mb-8">
          <View 
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="key" size={40} color="#3B82F6" />
          </View>
        </View>

        {/* Reset Form */}
        <View className="mb-6">
          {/* Show email for confirmation */}
          {userEmail && (
            <View className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                Resetting password for:
              </Text>
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                {userEmail}
              </Text>
            </View>
          )}

          <Input
            label="OTP Code"
            placeholder="Enter 6-digit OTP"
            value={formData.otp}
            onChangeText={(value) => updateFormData('otp', value)}
            leftIcon="shield-checkmark"
            keyboardType="numeric"
            maxLength={6}
            error={errors.otp}
          />

          <Input
            label="New Password"
            placeholder="Create a new password"
            value={formData.newPassword}
            onChangeText={(value) => updateFormData('newPassword', value)}
            leftIcon="lock-closed"
            isPassword
            error={errors.newPassword}
          />

          <Input
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            leftIcon="lock-closed"
            isPassword
            error={errors.confirmPassword}
          />

          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            loading={isLoading}
            fullWidth
          />
        </View>

        {/* Help Text */}
        <View 
          className="p-4 rounded-lg mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <Text 
            className="text-sm text-center"
            style={{ color: colors.textSecondary }}
          >
            💡 Check your email for the 6-digit OTP code. The OTP expires in 15 minutes.
          </Text>
        </View>

        {/* Back to Login */}
        <View className="flex-row items-center justify-center">
          <Text 
            className="text-sm"
            style={{ color: colors.textSecondary }}
          >
            Remember your password?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text className="text-sm text-blue-600 font-medium">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}