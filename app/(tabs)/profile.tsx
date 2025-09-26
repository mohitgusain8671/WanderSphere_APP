import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { USER_ROLES } from '../../utils/constants';
import { getInitials, capitalize } from '../../utils/helpers';

export default function ProfileScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAppStore();

  const handleLogout = async () => {
    await logout();
  };

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const profileOptions = [
    {
      icon: 'person-circle',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      color: '#3B82F6'
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      color: '#10B981'
    },
    {
      icon: 'shield-checkmark',
      title: 'Privacy & Security',
      subtitle: 'Control your privacy settings',
      color: '#F59E0B'
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      color: '#8B5CF6'
    },
    {
      icon: 'information-circle',
      title: 'About',
      subtitle: 'App version and information',
      color: '#6B7280'
    }
  ];

  if (isAdmin) {
    profileOptions.unshift({
      icon: 'settings',
      title: 'Admin Settings',
      subtitle: 'Manage app settings and users',
      color: '#EF4444'
    });
  }

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 pb-6">
          <Text 
            className="text-2xl font-bold"
            style={{ color: colors.text }}
          >
            Profile
          </Text>
          
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

        {/* Profile Header */}
        <View 
          className="p-6 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="items-center">
            <View 
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.background }}
            >
              <Ionicons 
                name="person" 
                size={48} 
                color={isAdmin ? '#F59E0B' : '#3B82F6'} 
              />
            </View>
            
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
            
            <View className="flex-row items-center mt-3">
              <View 
                className={`px-3 py-1 rounded-full ${isAdmin ? 'bg-amber-100' : 'bg-blue-100'}`}
              >
                <Text 
                  className={`text-sm font-medium ${isAdmin ? 'text-amber-800' : 'text-blue-800'}`}
                >
                  {isAdmin ? '👑 Administrator' : '🌟 Traveler'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Options */}
        <View className="mb-6">
          <Text 
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Settings
          </Text>
          
          <View className="space-y-2">
            {profileOptions.map((option, index) => (
              <TouchableOpacity 
                key={index}
                className="flex-row items-center p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${option.color}20` }}
                >
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-base font-semibold"
                    style={{ color: colors.text }}
                  >
                    {option.title}
                  </Text>
                  <Text 
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {option.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme Toggle */}
        <View 
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View 
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${isDarkMode ? '#F59E0B' : '#3B82F6'}20` }}
              >
                <Ionicons 
                  name={isDarkMode ? 'moon' : 'sunny'} 
                  size={24} 
                  color={isDarkMode ? '#F59E0B' : '#3B82F6'} 
                />
              </View>
              <View>
                <Text 
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text 
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Switch between light and dark themes
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={toggleTheme}
              className={`w-12 h-6 rounded-full p-1 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <View 
                className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Stats (for future features) */}
        <View 
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <Text 
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Your Journey
          </Text>
          
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text 
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                0
              </Text>
              <Text 
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                Places Visited
              </Text>
            </View>
            
            <View className="items-center">
              <Text 
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                0
              </Text>
              <Text 
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                Stories Shared
              </Text>
            </View>
            
            <View className="items-center">
              <Text 
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                0
              </Text>
              <Text 
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                Travel Buddies
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          fullWidth
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}