import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppStore } from "../../store";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { validateEmail } from "../../utils/validation";

export default function ForgotPasswordScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { forgotPassword, isLoading, error, clearError } = useAppStore();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");


  const validateEmailInput = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSendOTP = async () => {
    clearError();

    if (!validateEmailInput()) return;

    const result = await forgotPassword(email.toLowerCase().trim());

    if (result.success) {
      showSuccess('Password reset OTP sent to your email!', 3000);
      
      // Redirect to reset password page with userId and email
      setTimeout(() => {
        router.push({
          pathname: '/(auth)/reset-password',
          params: {
            userId: result.data?.userId || '',
            email: email.toLowerCase().trim()
          }
        });
      }, 1000);
    } else {
      showError(result.error || "Failed to send reset email. Please try again.");
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError("");
    }
  };



  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
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
              name={isDarkMode ? "sunny" : "moon"}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Text className="text-3xl font-bold" style={{ color: colors.text }}>
            Forgot Password?
          </Text>
          <Text
            className="text-lg mt-1"
            style={{ color: colors.textSecondary }}
          >
            No worries, we'll send you reset instructions
          </Text>
        </View>

        {/* Lock Icon */}
        <View className="items-center mb-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="lock-closed" size={40} color="#F59E0B" />
          </View>
        </View>

        {/* Email Form */}
        <View className="mb-6">
          <Input
            label="Email Address"
            placeholder="Enter your email address"
            value={email}
            onChangeText={handleEmailChange}
            leftIcon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />

          <Button
            title="Send Reset OTP"
            onPress={handleSendOTP}
            loading={isLoading}
            fullWidth
          />
        </View>

        {/* Back to Login */}
        <View className="flex-row items-center justify-center">
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Remember your password?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
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
      </ScrollView>
    </SafeAreaView>
  );
}
