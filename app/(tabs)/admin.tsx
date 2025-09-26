import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { capitalize, formatTime } from '../../utils/helpers';

export default function AdminScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user } = useAppStore();

  const adminStats = [
    { title: 'Total Users', value: '1,234', icon: 'people', color: '#3B82F6' },
    { title: 'Active Stories', value: '567', icon: 'book', color: '#10B981' },
    { title: 'Destinations', value: '89', icon: 'location', color: '#F59E0B' },
    { title: 'Reports', value: '12', icon: 'flag', color: '#EF4444' },
  ];

  const adminActions = [
    {
      title: 'User Management',
      subtitle: 'Manage user accounts and permissions',
      icon: 'people-circle',
      color: '#3B82F6'
    },
    {
      title: 'Content Moderation',
      subtitle: 'Review and moderate user content',
      icon: 'shield-checkmark',
      color: '#10B981'
    },
    {
      title: 'Analytics Dashboard',
      subtitle: 'View app usage and statistics',
      icon: 'analytics',
      color: '#F59E0B'
    },
    {
      title: 'System Settings',
      subtitle: 'Configure app settings and features',
      icon: 'settings',
      color: '#8B5CF6'
    },
    {
      title: 'Reports & Feedback',
      subtitle: 'Handle user reports and feedback',
      icon: 'chatbubbles',
      color: '#EF4444'
    },
    {
      title: 'Backup & Security',
      subtitle: 'Manage data backup and security',
      icon: 'lock-closed',
      color: '#6B7280'
    }
  ];

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
              Admin Dashboard
            </Text>
            <Text 
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
              Welcome back, {capitalize(user?.firstName || '')}! 👑
            </Text>
          </View>
          
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

        {/* Stats Grid */}
        <View className="mb-6">
          <Text 
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Overview
          </Text>
          
          <View className="flex-row flex-wrap gap-3">
            {adminStats.map((stat, index) => (
              <View 
                key={index}
                className="flex-1 min-w-[45%] p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                  </View>
                </View>
                <Text 
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stat.value}
                </Text>
                <Text 
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {stat.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text 
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Admin Tools
          </Text>
          
          <View className="space-y-3">
            {adminActions.map((action, index) => (
              <TouchableOpacity 
                key={index}
                className="flex-row items-center p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${action.color}20` }}
                >
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-base font-semibold"
                    style={{ color: colors.text }}
                  >
                    {action.title}
                  </Text>
                  <Text 
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {action.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View 
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <Text 
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Recent Activity
          </Text>
          
          <View className="space-y-3">
            {[
              { action: 'New user registered', time: '2 minutes ago', icon: 'person-add', color: '#10B981' },
              { action: 'Story reported', time: '15 minutes ago', icon: 'flag', color: '#EF4444' },
              { action: 'New destination added', time: '1 hour ago', icon: 'location', color: '#3B82F6' },
              { action: 'User feedback received', time: '2 hours ago', icon: 'chatbubble', color: '#F59E0B' },
            ].map((activity, index) => (
              <View key={index} className="flex-row items-center">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${activity.color}20` }}
                >
                  <Ionicons name={activity.icon as any} size={16} color={activity.color} />
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-sm font-medium"
                    style={{ color: colors.text }}
                  >
                    {activity.action}
                  </Text>
                  <Text 
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {activity.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* System Status */}
        <View 
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <Text 
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            System Status
          </Text>
          
          <View className="space-y-3">
            {[
              { service: 'API Server', status: 'Online', color: '#10B981' },
              { service: 'Database', status: 'Online', color: '#10B981' },
              { service: 'Email Service', status: 'Online', color: '#10B981' },
              { service: 'File Storage', status: 'Online', color: '#10B981' },
            ].map((service, index) => (
              <View key={index} className="flex-row items-center justify-between">
                <Text 
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  {service.service}
                </Text>
                <View className="flex-row items-center">
                  <View 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: service.color }}
                  />
                  <Text 
                    className="text-sm"
                    style={{ color: service.color }}
                  >
                    {service.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}