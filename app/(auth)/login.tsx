import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { APP_NAME } from '../../utils/constants';
import { validateEmail, validateForm } from '../../utils/validation';
import { useToast } from '../../contexts/ToastContext';


export default function LoginScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { login, isLoading, error, clearError } = useAppStore();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateFormData = () => {
    const validationRules = {
      email: (value: string) => {
        if (!value.trim()) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email';
        return null;
      },
      password: (value: string) => {
        if (!value.trim()) return 'Password is required';
        return null;
      }
    };

    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleLogin = async () => {
    clearError();
    
    if (!validateFormData()) return;

    const result = await login({
      email: formData.email.toLowerCase().trim(),
      password: formData.password
    });

    if (result.success) {
      showSuccess('Login successful! Welcome back!', 3000);
      // Navigation will be handled by the layout based on auth state
    } else {
      showError(result.error || 'Login failed. Please try again.');
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
        <View className="flex-row items-center justify-between pt-6 pb-12">
          <View className="flex-1">
            <Text 
              className="text-3xl font-bold mb-2"
              style={{ color: colors.text }}
            >
              Welcome Back
            </Text>
            <Text 
              className="text-lg"
              style={{ color: colors.textSecondary }}
            >
              Sign in to {APP_NAME}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={toggleTheme}
            className="p-3 rounded-full ml-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons 
              name={isDarkMode ? 'sunny' : 'moon'} 
              size={24} 
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Travel Icon */}
        <View className="items-center mb-12">
          <View 
            className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="airplane" size={48} color="#3B82F6" />
          </View>
          <Text 
            className="text-sm mt-3 font-medium"
            style={{ color: colors.textSecondary }}
          >
            Your travel companion
          </Text>
        </View>

        {/* Login Form */}
        <View className="mb-6">
          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            leftIcon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            leftIcon="lock-closed"
            isPassword
            error={errors.password}
          />

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/forgot-password')}
            className="self-end mb-6"
          >
            <Text className="text-blue-600 font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
          />
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View 
            className="flex-1 h-px"
            style={{ backgroundColor: colors.border }}
          />
          <Text 
            className="mx-4 text-sm"
            style={{ color: colors.textSecondary }}
          >
            Don't have an account?
          </Text>
          <View 
            className="flex-1 h-px"
            style={{ backgroundColor: colors.border }}
          />
        </View>

        {/* Register Link */}
        <Button
          title="Create New Account"
          variant="outline"
          onPress={() => router.push('/(auth)/register')}
          fullWidth
        />

        {/* Error Message */}
        {error && (
          <View className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}