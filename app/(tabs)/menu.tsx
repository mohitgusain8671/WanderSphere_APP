import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useAppStore } from '../../store';
import { COLORS } from '../../utils/constants';
import { capitalize } from '../../utils/helpers';

export default function MenuScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAppStore();
  const { showSuccess, showError } = useToast();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              showSuccess('Logged out successfully');
            } else {
              showError('Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleViewProfile = () => {
    router.push('/(tabs)/profile');
  };

  const handleAddPost = () => {
    router.push('./add-post');
  };

  const handleAddStory = () => {
    router.push('./add-story');
  };

  const menuOptions = [
    {
      id: 'profile',
      title: 'View Profile',
      subtitle: 'See and edit your profile',
      icon: 'person-circle',
      color: COLORS.primary,
      onPress: handleViewProfile
    },
    {
      id: 'add-post',
      title: 'Add Post',
      subtitle: 'Share your travel moments',
      icon: 'add-circle',
      color: COLORS.secondary,
      onPress: handleAddPost
    },
    {
      id: 'add-story',
      title: 'Add Story',
      subtitle: 'Share your daily adventures',
      icon: 'camera-outline',
      color: COLORS.accent,
      onPress: handleAddStory
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      icon: 'log-out',
      color: COLORS.danger,
      onPress: handleLogout
    }
  ];

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-6 pb-8">
          <View className="flex-1">
            <Text 
              className="text-3xl font-bold mb-2"
              style={{ color: colors.text }}
            >
              Menu
            </Text>
            <Text 
              className="text-lg"
              style={{ color: colors.textSecondary }}
            >
              Hello, {capitalize(user?.firstName || '')}! 👋
            </Text>
          </View>
          
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

        {/* User Info Card */}
        <View 
          className="p-6 rounded-xl mb-8"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-row items-center">
            <View className="mr-4">
              <ProfileAvatar 
                size={64} 
                style={{ backgroundColor: colors.background }}
                showDefaultIcon={false}
              />
            </View>
            <View className="flex-1">
              <Text 
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                {capitalize(user?.firstName || '')} {capitalize(user?.lastName || '')}
              </Text>
              <Text 
                className="text-sm mt-1"
                style={{ color: colors.textSecondary }}
              >
                {user?.email}
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="px-3 py-1 rounded-full bg-blue-100">
                  <Text className="text-xs font-medium text-blue-800">
                    🌟 Traveler
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View className="mb-6">
          <Text 
            className="text-xl font-bold mb-6"
            style={{ color: colors.text }}
          >
            Quick Actions
          </Text>
          
          <View className="space-y-4">
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={option.onPress}
                className="flex-row items-center p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${option.color}20` }}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={option.color} 
                  />
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-base font-semibold"
                    style={{ color: colors.text }}
                  >
                    {option.title}
                  </Text>
                  <Text 
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    {option.subtitle}
                  </Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coming Soon Section */}
        <View 
          className="p-6 rounded-xl mb-8"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="items-center">
            <Ionicons name="construct" size={48} color={COLORS.accent} />
            <Text 
              className="text-lg font-bold mt-4 mb-2"
              style={{ color: colors.text }}
            >
              More Features Coming Soon!
            </Text>
            <Text 
              className="text-sm text-center"
              style={{ color: colors.textSecondary }}
            >
              We're working on exciting new features like settings, help center, and more travel tools.
            </Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}