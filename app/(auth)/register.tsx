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
import { 
  wp, hp, spacing, typography, layout, iconSizes, 
  deviceResponsive, isSmallDevice 
} from '../../utils/responsive';

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
      style={{ 
        flex: 1, 
        backgroundColor: colors.background 
      }}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: layout.container.paddingHorizontal,
          paddingBottom: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: spacing.xl,
          paddingBottom: spacing.lg
        }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{
              padding: spacing.md,
              borderRadius: wp(50),
              backgroundColor: colors.surface,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="arrow-back" size={iconSizes.md} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleTheme}
            style={{
              padding: spacing.md,
              borderRadius: wp(50),
              backgroundColor: colors.surface,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons 
              name={isDarkMode ? 'sunny' : 'moon'} 
              size={iconSizes.md} 
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={{
          marginBottom: deviceResponsive({
            small: wp(8),
            medium: wp(10),
            large: wp(12),
            tablet: wp(15),
            default: wp(10)
          })
        }}>
          <Text 
            style={{ 
              ...typography.h1,
              color: colors.text,
              marginBottom: spacing.sm
            }}
          >
            Create Account
          </Text>
          <Text 
            style={{ 
              ...typography.body,
              color: colors.textSecondary 
            }}
          >
            Join {APP_NAME} community
          </Text>
        </View>

        {/* Travel Icon */}
        <View style={{
          alignItems: 'center',
          marginBottom: deviceResponsive({
            small: wp(8),
            medium: wp(10),
            large: wp(12),
            tablet: wp(15),
            default: wp(10)
          })
        }}>
          <View 
            style={{
              width: deviceResponsive({
                small: wp(20),
                medium: wp(24),
                large: wp(26),
                tablet: wp(20),
                default: wp(24)
              }),
              height: deviceResponsive({
                small: wp(20),
                medium: wp(24),
                large: wp(26),
                tablet: wp(20),
                default: wp(24)
              }),
              borderRadius: wp(50),
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Ionicons 
              name="earth" 
              size={deviceResponsive({
                small: iconSizes.xl,
                medium: iconSizes.xxl + 8,
                large: iconSizes.xxl + 16,
                tablet: iconSizes.xxl + 12,
                default: iconSizes.xxl + 8
              })} 
              color="#10B981" 
            />
          </View>
          <Text 
            style={{
              ...typography.bodySmall,
              marginTop: spacing.sm,
              color: colors.textSecondary
            }}
          >
            Start your journey
          </Text>
        </View>

        {/* Registration Form */}
        <View style={{ marginBottom: spacing.xl }}>
          <View style={{
            flexDirection: 'row',
            gap: spacing.md,
            marginBottom: spacing.lg
          }}>
            <View style={{ flex: 1 }}>
              <Input
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                leftIcon="person"
                error={errors.firstName}
              />
            </View>
            <View style={{ flex: 1 }}>
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
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.xl
        }}>
          <View 
            style={{
              flex: 1,
              height: 1,
              backgroundColor: colors.border
            }}
          />
          <Text 
            style={{
              ...typography.bodySmall,
              marginHorizontal: spacing.md,
              color: colors.textSecondary
            }}
          >
            Already have an account?
          </Text>
          <View 
            style={{
              flex: 1,
              height: 1,
              backgroundColor: colors.border
            }}
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
          <View style={{
            marginTop: spacing.lg,
            padding: spacing.md,
            borderRadius: layout.card.borderRadius,
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FECACA'
          }}>
            <Text style={{
              ...typography.bodySmall,
              color: '#EF4444',
              textAlign: 'center'
            }}>
              {error}
            </Text>
          </View>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}