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
import { 
  wp, hp, spacing, typography, layout, iconSizes, 
  deviceResponsive, isSmallDevice 
} from '../../utils/responsive';


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
          paddingTop: deviceResponsive({
            small: spacing.lg,
            medium: spacing.xl,
            large: spacing.xxl,
            tablet: wp(8),
            default: spacing.xl
          }),
          paddingBottom: deviceResponsive({
            small: spacing.xl,
            medium: wp(12),
            large: wp(15),
            tablet: wp(18),
            default: wp(12)
          })
        }}>
          <View style={{ flex: 1 }}>
            <Text 
              style={{ 
                ...typography.h1,
                color: colors.text,
                marginBottom: spacing.sm
              }}
            >
              Welcome Back
            </Text>
            <Text 
              style={{ 
                ...typography.body,
                color: colors.textSecondary 
              }}
            >
              Sign in to {APP_NAME}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={toggleTheme}
            style={{
              padding: spacing.md,
              borderRadius: wp(50),
              marginLeft: spacing.md,
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

        {/* Travel Icon */}
        <View style={{
          alignItems: 'center',
          marginBottom: deviceResponsive({
            small: wp(10),
            medium: wp(12),
            large: wp(15),
            tablet: wp(18),
            default: wp(12)
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
              name="airplane" 
              size={deviceResponsive({
                small: iconSizes.xl,
                medium: iconSizes.xxl + 8,
                large: iconSizes.xxl + 16,
                tablet: iconSizes.xxl + 12,
                default: iconSizes.xxl + 8
              })} 
              color="#3B82F6" 
            />
          </View>
          <Text 
            style={{
              ...typography.bodySmall,
              marginTop: spacing.sm,
              color: colors.textSecondary
            }}
          >
            Your travel companion
          </Text>
        </View>

        {/* Login Form */}
        <View style={{ marginBottom: spacing.xl }}>
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
            style={{
              alignSelf: 'flex-end',
              marginBottom: spacing.xl,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.xs
            }}
          >
            <Text style={{
              ...typography.bodySmall,
              color: '#3B82F6',
              fontWeight: '600'
            }}>
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
            Don't have an account?
          </Text>
          <View 
            style={{
              flex: 1,
              height: 1,
              backgroundColor: colors.border
            }}
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
      </ScrollView>
    </SafeAreaView>
  );
}