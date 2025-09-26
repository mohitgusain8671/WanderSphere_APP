import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { APP_NAME, USER_ROLES } from '../../utils/constants';
import { capitalize } from '../../utils/helpers';

export default function HomeScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAppStore();

  const handleLogout = async () => {
    await logout();
  };

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 pb-6">
          <View>
            <Text 
              className="text-2xl font-bold"
              style={{ color: colors.text }}
            >
              Welcome to {APP_NAME}
            </Text>
            <Text 
              className="text-base mt-1"
              style={{ color: colors.textSecondary }}
            >
              Hello, {capitalize(user?.firstName || '')}! 👋
            </Text>
          </View>
          
          <View className="flex-row space-x-2">
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
        </View>

        {/* User Info Card */}
        <View 
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-row items-center mb-4">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: colors.background }}
            >
              <Ionicons 
                name="person" 
                size={32} 
                color={isAdmin ? '#F59E0B' : '#3B82F6'} 
              />
            </View>
            <View className="flex-1">
              <Text 
                className="text-lg font-semibold"
                style={{ color: colors.text }}
              >
                {capitalize(user?.firstName || '')} {capitalize(user?.lastName || '')}
              </Text>
              <Text 
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                {user?.email}
              </Text>
              <View className="flex-row items-center mt-1">
                <View 
                  className={`px-2 py-1 rounded-full ${isAdmin ? 'bg-amber-100' : 'bg-blue-100'}`}
                >
                  <Text 
                    className={`text-xs font-medium ${isAdmin ? 'text-amber-800' : 'text-blue-800'}`}
                  >
                    {isAdmin ? '👑 Admin' : '🌟 User'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Travel Features */}
        <View className="mb-6">
          <Text 
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Explore Features
          </Text>
          
          <View className="space-y-3">
            {/* Discover Places */}
            <TouchableOpacity 
              className="flex-row items-center p-4 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Ionicons name="location" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text 
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  Discover Places
                </Text>
                <Text 
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Find amazing destinations around the world
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Travel Stories */}
            <TouchableOpacity 
              className="flex-row items-center p-4 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-4">
                <Ionicons name="camera" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text 
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  Travel Stories
                </Text>
                <Text 
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Share your travel experiences
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Travel Buddies */}
            <TouchableOpacity 
              className="flex-row items-center p-4 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mr-4">
                <Ionicons name="people" size={24} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text 
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  Find Travel Buddies
                </Text>
                <Text 
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Connect with fellow travelers
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity 
                className="flex-row items-center p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mr-4">
                  <Ionicons name="settings" size={24} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-base font-semibold"
                    style={{ color: colors.text }}
                  >
                    Admin Dashboard
                  </Text>
                  <Text 
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Manage users and content
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Coming Soon */}
        <View 
          className="p-6 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="items-center">
            <Ionicons name="construct" size={48} color="#F59E0B" />
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
              We're working hard to bring you amazing travel features. Stay tuned for updates!
            </Text>
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