import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';

export default function PostsManagement() {
  const { colors } = useTheme();
  const {
    adminPosts,
    isAdminPostsLoading,
    getAllPosts,
    deletePost,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const filters: any = {};
    if (searchQuery) filters.search = searchQuery;
    
    await getAllPosts(filters);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadPosts();
  };

  const handleDeletePost = (postId: string, userName: string) => {
    Alert.alert(
      'Delete Post',
      `Are you sure you want to delete this post by ${userName}? The user will be notified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deletePost(postId);
            if (result.success) {
              Alert.alert('Success', 'Post deleted successfully. User has been notified.');
              loadPosts();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search and Filters */}
      <View style={{ padding: 16, backgroundColor: colors.surface }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12 }}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: colors.text, fontSize: 14 }}
              placeholder="Search posts..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{ backgroundColor: colors.background, padding: 10, borderRadius: 8 }}
          >
            <Ionicons name="filter" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.background, padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>{adminPosts.length}</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Posts</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.background, padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#10B981' }}>
              {adminPosts.filter((p: any) => p.likesCount > 10).length}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Popular</Text>
          </View>
        </View>
      </View>

      {/* Posts List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />
        }
      >
        {isAdminPostsLoading && !adminPosts.length ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading posts...</Text>
          </View>
        ) : adminPosts.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="images-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>No posts found</Text>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 12 }}>
            {adminPosts.map((post: any) => (
              <View
                key={post._id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {/* User Info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#3B82F6',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                      {post.userId?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                      {post.userId?.firstName} {post.userId?.lastName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* Post Content */}
                {post.description && (
                  <Text style={{ fontSize: 14, color: colors.text, marginBottom: 12 }} numberOfLines={3}>
                    {post.description}
                  </Text>
                )}

                {/* Post Media */}
                {post.mediaFiles && post.mediaFiles.length > 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <Image
                      source={{ uri: post.mediaFiles[0].url }}
                      style={{ width: '100%', height: 200, borderRadius: 8 }}
                      resizeMode="cover"
                    />
                    {post.mediaFiles.length > 1 && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                          +{post.mediaFiles.length - 1}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Post Stats */}
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="heart" size={16} color="#EF4444" />
                    <Text style={{ marginLeft: 4, fontSize: 14, color: colors.textSecondary }}>
                      {post.likesCount || 0}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="chatbubble" size={16} color="#3B82F6" />
                    <Text style={{ marginLeft: 4, fontSize: 14, color: colors.textSecondary }}>
                      {post.commentsCount || 0}
                    </Text>
                  </View>
                  {post.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location" size={16} color="#10B981" />
                      <Text style={{ marginLeft: 4, fontSize: 14, color: colors.textSecondary }}>
                        {post.location.name}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <TouchableOpacity
                  onPress={() =>
                    handleDeletePost(post._id, `${post.userId?.firstName} ${post.userId?.lastName}`)
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#EF4444',
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                  <Text style={{ marginLeft: 6, color: 'white', fontSize: 14, fontWeight: '600' }}>Delete Post</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
