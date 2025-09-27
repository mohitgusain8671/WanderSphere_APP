import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../store';
import { COLORS } from '../utils/constants';
import { PostCard } from './PostCard';

interface InfiniteScrollViewProps {
  onPostPress?: (post: any) => void;
  onCommentPress?: (post: any) => void;
  onUserPress?: (userId: string) => void;
  userId?: string; // For user-specific posts
  headerComponent?: () => React.ReactElement;
}

export const InfiniteScrollView: React.FC<InfiniteScrollViewProps> = ({
  onPostPress,
  onCommentPress,
  onUserPress,
  userId,
  headerComponent
}) => {
  const { colors } = useTheme();
  const { 
    posts, 
    userPosts, 
    hasMore, 
    userHasMore, 
    isPostsLoading, 
    isUserPostsLoading,
    getPosts, 
    getUserPosts,
    loadMorePosts,
    loadMoreUserPosts 
  } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  // Use appropriate posts and loading state based on whether we're showing user posts
  const currentPosts = userId ? userPosts : posts;
  const currentHasMore = userId ? userHasMore : hasMore;
  const currentIsLoading = userId ? isUserPostsLoading : isPostsLoading;

  useEffect(() => {
    // Load initial posts
    if (userId) {
      getUserPosts(userId, 1);
    } else {
      getPosts(1);
    }
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await getUserPosts(userId, 1);
    } else {
      await getPosts(1);
    }
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (userId) {
      if (userHasMore && !isUserPostsLoading) {
        await loadMoreUserPosts(userId);
      }
    } else {
      if (hasMore && !isPostsLoading) {
        await loadMorePosts();
      }
    }
  };

  const renderPost = ({ item: post }: { item: any }) => (
    <PostCard
      post={post}
      onPress={() => onPostPress?.(post)}
      onCommentPress={() => onCommentPress?.(post)}
      onUserPress={onUserPress}
    />
  );

  const renderLoadingIndicator = () => {
    if (!currentIsLoading) return null;
    
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (currentIsLoading) return null;
    
    return (
      <View className="flex-1 items-center justify-center py-20">
        <View 
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
        </View>
        <Text 
          className="text-lg font-semibold mb-2"
          style={{ color: colors.text }}
        >
          No posts yet
        </Text>
        <Text 
          className="text-sm text-center px-8"
          style={{ color: colors.textSecondary }}
        >
          {userId 
            ? "This user hasn't posted anything yet" 
            : "Start following friends to see their posts, or create your own!"
          }
        </Text>
      </View>
    );
  };

  const renderEndMessage = () => {
    if (currentHasMore || currentPosts.length === 0) return null;
    
    return (
      <View className="py-8 items-center">
        <View 
          className="w-16 h-16 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        </View>
        <Text 
          className="text-base font-semibold mb-1"
          style={{ color: colors.text }}
        >
          You're all caught up!
        </Text>
        <Text 
          className="text-sm text-center px-8"
          style={{ color: colors.textSecondary }}
        >
          You've seen all the latest posts. Check back later for more updates.
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={currentPosts}
      renderItem={renderPost}
      keyExtractor={(item) => item._id}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      ListHeaderComponent={headerComponent}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={
        <View>
          {renderLoadingIndicator()}
          {renderEndMessage()}
        </View>
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 20,
        flexGrow: 1
      }}
    />
  );
};