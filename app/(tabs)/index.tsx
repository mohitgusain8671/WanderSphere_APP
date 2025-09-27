import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfiniteScrollView } from '../../components/InfiniteScrollView';
import { StoriesBar } from '../../components/StoriesBar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { APP_NAME } from '../../utils/constants';

export default function HomeScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { storyGroups, getStories, getUnreadCount } = useAppStore();
  const [refreshingStories, setRefreshingStories] = useState(false);

  useEffect(() => {
    // Load stories and notifications count on mount
    loadStories();
    getUnreadCount();
  }, []);

  const loadStories = async () => {
    setRefreshingStories(true);
    await getStories();
    setRefreshingStories(false);
  };

  const handleStoryPress = (storyGroup: any) => {
    // TODO: Navigate to story viewer
    console.log('View stories for:', storyGroup.author.firstName);
  };

  const handleAddStoryPress = () => {
    router.push('/(tabs)/add-story');
  };

  const handleAddPostPress = () => {
    router.push('/(tabs)/add-post');
  };

  const handlePostPress = (post: any) => {
    // TODO: Navigate to post detail screen
    console.log('View post:', post._id);
  };

  const handleCommentPress = (post: any) => {
    // TODO: Navigate to comments screen
    console.log('View comments for post:', post._id);
    Alert.alert('Comments', `Viewing comments for ${post.author.firstName}'s post`);
  };

  const handleUserPress = (userId: string) => {
    // TODO: Navigate to user profile
    console.log('View user profile:', userId);
  };

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <Text 
          className="text-2xl font-bold"
          style={{ color: colors.text }}
        >
          {APP_NAME}
        </Text>
        
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity 
            onPress={toggleTheme}
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons 
              name={isDarkMode ? 'sunny' : 'moon'} 
              size={20} 
              color={colors.text}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        {/* Stories Section */}
        {!refreshingStories && storyGroups.length > 0 && (
          <StoriesBar
            storyGroups={storyGroups}
            onStoryPress={handleStoryPress}
            onAddStoryPress={handleAddStoryPress}
          />
        )}

        {/* Posts Feed */}
        <View className="flex-1">
          <InfiniteScrollView
            onPostPress={handlePostPress}
            onCommentPress={handleCommentPress}
            onUserPress={handleUserPress}
          />
        </View>
      </View>


    </SafeAreaView>
  );
}
