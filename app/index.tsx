import React from 'react';
import { View, Text } from 'react-native';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function IndexScreen() {
  // This is a placeholder screen that will be replaced by navigation
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <LoadingSpinner />
      <Text className="mt-4 text-gray-600">Loading WanderSphere...</Text>
    </View>
  );
}