import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../store';

interface StoriesBarProps {
  storyGroups: any[];
  onStoryPress: (storyGroup: any, startIndex?: number) => void;
  onAddStoryPress: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  storyGroups,
  onStoryPress,
  onAddStoryPress
}) => {
  const { colors } = useTheme();
  const { user } = useAppStore();

  const renderStoryItem = (storyGroup: any, index: number) => {
    const isCurrentUser = storyGroup.author._id === user?.id;
    const hasUnviewed = storyGroup.hasUnviewed;

    return (
      <TouchableOpacity
        key={storyGroup.author._id}
        onPress={() => onStoryPress(storyGroup)}
        className="items-center mr-4"
        style={{ width: 70 }}
      >
        <View className="relative">
          <View 
            className={`w-16 h-16 rounded-full p-0.5 ${
              hasUnviewed ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''
            }`}
            style={{ 
              backgroundColor: hasUnviewed ? undefined : colors.border,
            }}
          >
            <View 
              className="w-full h-full rounded-full items-center justify-center"
              style={{ backgroundColor: colors.background }}
            >
              {storyGroup.author.profilePicture ? (
                <Image
                  source={{ uri: storyGroup.author.profilePicture }}
                  className="w-14 h-14 rounded-full"
                />
              ) : (
                <Ionicons name="person" size={28} color={colors.text} />
              )}
            </View>
          </View>
          
          {/* Add icon for current user */}
          {isCurrentUser && (
            <TouchableOpacity
              onPress={onAddStoryPress}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
              style={{ backgroundColor: '#3B82F6' }}
            >
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text 
          className="text-xs mt-1 text-center font-medium"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {isCurrentUser ? 'Your Story' : storyGroup.author.firstName}
        </Text>
      </TouchableOpacity>
    );
  };

  // Add current user's story group if not already present
  const userStoryGroup = storyGroups.find(group => group.author._id === user?.id);
  const hasUserStories = !!userStoryGroup;

  return (
    <View className="py-4">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {/* Add Story button for current user if no stories */}
        {!hasUserStories && (
          <TouchableOpacity
            onPress={onAddStoryPress}
            className="items-center mr-4"
            style={{ width: 70 }}
          >
            <View 
              className="w-16 h-16 rounded-full border-2 border-dashed items-center justify-center"
              style={{ borderColor: colors.textSecondary }}
            >
              <Ionicons name="add" size={28} color={colors.textSecondary} />
            </View>
            <Text 
              className="text-xs mt-1 text-center font-medium"
              style={{ color: colors.text }}
            >
              Add Story
            </Text>
          </TouchableOpacity>
        )}

        {storyGroups.map((storyGroup, index) => renderStoryItem(storyGroup, index))}
      </ScrollView>
    </View>
  );
};