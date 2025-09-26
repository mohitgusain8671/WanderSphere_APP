import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { APP_NAME } from '../../utils/constants';
import { validateEmail, validateName, validateForm } from '../../utils/validation';
import { capitalize } from '../../utils/helpers';

export default function RegisterScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { register, isLoading, error, clearError } = useAppStore();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateFormData = () => {
    const validationRules = {
      firstName: (value: string) => validateName(value, 'First name'),
      lastName: (value: string) => validateName(value, 'Last name'),
      email: (value: string) => {
        if (!value.trim()) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email';
        return null;
      },
      password: (value: string) => {
        if (!value.trim()) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      confirmPassword: (value: string) => {
        if (!value.trim()) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return null;
      }
    };

    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleRegister = async () => {
    clearError();
    
    if (!validateFormData()) return;

    const result = await register({
      firstName: capitalize(formData.firstName.trim()),
      lastName: capitalize(formData.lastName.trim()),
      email: formData.email.toLowerCase().trim(),
      password: formData.password
    });

    if (result.success) {
      showSuccess(
        result.message || 'Registration successful! Please check your email for verification link.',
        6000
      );
      // Navigate to login after showing success message
      setTimeout(() => {
        router.push('/(auth)/login');
      }, 2000);
    } else {
      showError(result.error || 'Registration failed. Please try again.');
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
        <View className="flex-row items-center justify-between pt-6 pb-8">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-3 rounded-full"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleTheme}
            className="p-3 rounded-full"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons 
              name={isDarkMode ? 'sunny' : 'moon'} 
              size={24} 
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View className="mb-10">
          <Text 
            className="text-3xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Create Account
          </Text>
          <Text 
            className="text-lg"
            style={{ color: colors.textSecondary }}
          >
            Join {APP_NAME} community
          </Text>
        </View>

        {/* Travel Icon */}
        <View className="items-center mb-10">
          <View 
            className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="earth" size={48} color="#10B981" />
          </View>
          <Text 
            className="text-sm mt-3 font-medium"
            style={{ color: colors.textSecondary }}
          >
            Start your journey
          </Text>
        </View>

        {/* Registration Form */}
        <View className="mb-6">
          <View className="flex-row space-x-3 mb-4">
            <View className="flex-1">
              <Input
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                leftIcon="person"
                error={errors.firstName}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                leftIcon="person"
                error={errors.lastName}
              />
            </View>
          </View>

          <Input
            label="Email"
            placeholder="john@example.com"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            leftIcon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            leftIcon="lock-closed"
            isPassword
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            leftIcon="lock-closed"
            isPassword
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            variant="secondary"
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
            Already have an account?
          </Text>
          <View 
            className="flex-1 h-px"
            style={{ backgroundColor: colors.border }}
          />
        </View>

        {/* Login Link */}
        <Button
          title="Sign In Instead"
          variant="outline"
          onPress={() => router.replace('/(auth)/login')}
          fullWidth
        />

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