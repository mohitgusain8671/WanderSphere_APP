import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function StoriesScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();

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
            Travel Stories
          </Text>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="add" size={24} color={colors.text} />
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
        </View>

        {/* Create Story Card */}
        <TouchableOpacity 
          className="p-6 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Ionicons name="camera" size={32} color="#3B82F6" />
            </View>
            <Text 
              className="text-lg font-bold mb-2"
              style={{ color: colors.text }}
            >
              Share Your Adventure
            </Text>
            <Text 
              className="text-sm text-center"
              style={{ color: colors.textSecondary }}
            >
              Create your first travel story and inspire others with your journey
            </Text>
          </View>
        </TouchableOpacity>

        {/* Story Categories */}
        <View className="mb-6">
          <Text 
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Story Categories
          </Text>
          
          <View className="flex-row flex-wrap gap-3">
            {[
              { name: 'Adventure', icon: 'mountain', color: '#EF4444' },
              { name: 'Culture', icon: 'library', color: '#F59E0B' },
              { name: 'Food', icon: 'restaurant', color: '#10B981' },
              { name: 'Nature', icon: 'leaf', color: '#3B82F6' },
              { name: 'City', icon: 'business', color: '#8B5CF6' },
              { name: 'Beach', icon: 'water', color: '#06B6D4' },
            ].map((category, index) => (
              <TouchableOpacity 
                key={index}
                className="flex-row items-center px-4 py-2 rounded-full"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <Ionicons name={category.icon as any} size={16} color={category.color} />
                <Text 
                  className="ml-2 text-sm font-medium"
                  style={{ color: category.color }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Empty State */}
        <View 
          className="p-6 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="items-center">
            <Ionicons name="book" size={48} color={colors.textSecondary} />
            <Text 
              className="text-lg font-bold mt-4 mb-2"
              style={{ color: colors.text }}
            >
              No Stories Yet
            </Text>
            <Text 
              className="text-sm text-center"
              style={{ color: colors.textSecondary }}
            >
              Start sharing your travel experiences and connect with fellow travelers around the world.
            </Text>
          </View>
        </View>

        {/* Features Coming Soon */}
        <View 
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <Text 
            className="text-base font-semibold mb-3"
            style={{ color: colors.text }}
          >
            Coming Soon Features:
          </Text>
          
          <View className="space-y-2">
            {[
              '📸 Photo & Video Stories',
              '🗺️ Location Tagging',
              '❤️ Like & Comment System',
              '🔄 Share Stories',
              '🏆 Featured Stories',
              '👥 Follow Other Travelers'
            ].map((feature, index) => (
              <Text 
                key={index}
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                {feature}
              </Text>
            ))}
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}