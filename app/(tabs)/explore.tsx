import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function ExploreScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();

  const destinations = [
    { name: 'Paris, France', icon: '🗼', color: '#EF4444' },
    { name: 'Tokyo, Japan', icon: '🏯', color: '#F59E0B' },
    { name: 'New York, USA', icon: '🗽', color: '#3B82F6' },
    { name: 'London, UK', icon: '🏰', color: '#10B981' },
    { name: 'Sydney, Australia', icon: '🏖️', color: '#8B5CF6' },
    { name: 'Dubai, UAE', icon: '🏜️', color: '#F59E0B' },
  ];

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
            Explore
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

        {/* Search Bar */}
        <View 
          className="flex-row items-center p-4 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text 
            className="ml-3 text-base"
            style={{ color: colors.textSecondary }}
          >
            Search destinations...
          </Text>
        </View>

        {/* Popular Destinations */}
        <View className="mb-6">
          <Text 
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Popular Destinations
          </Text>
          
          <View className="space-y-3">
            {destinations.map((destination, index) => (
              <TouchableOpacity 
                key={index}
                className="flex-row items-center p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${destination.color}20` }}
                >
                  <Text className="text-2xl">{destination.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-base font-semibold"
                    style={{ color: colors.text }}
                  >
                    {destination.name}
                  </Text>
                  <Text 
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Discover amazing places and experiences
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coming Soon */}
        <View 
          className="p-6 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="items-center">
            <Ionicons name="map" size={48} color="#3B82F6" />
            <Text 
              className="text-lg font-bold mt-4 mb-2"
              style={{ color: colors.text }}
            >
              Interactive Map Coming Soon!
            </Text>
            <Text 
              className="text-sm text-center"
              style={{ color: colors.textSecondary }}
            >
              Explore destinations on an interactive map with reviews, photos, and travel tips.
            </Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}