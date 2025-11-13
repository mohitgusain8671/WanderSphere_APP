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

export default function StoriesManagement() {
  const { colors } = useTheme();
  const {
    adminStories,
    isAdminStoriesLoading,
    getAllStories,
    deleteStory,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const filters: any = {};
    if (searchQuery) filters.search = searchQuery;
    
    await getAllStories(filters);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStories();
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadStories();
  };

  const handleDeleteStory = (storyId: string, userName: string) => {
    Alert.alert(
      'Delete Story',
      `Are you sure you want to delete this story by ${userName}? The user will be notified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteStory(storyId);
            if (result.success) {
              Alert.alert('Success', 'Story deleted successfully. User has been notified.');
              loadStories();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete story');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search */}
      <View style={{ padding: 16, backgroundColor: colors.surface }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12 }}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: colors.text, fontSize: 14 }}
              placeholder="Search stories..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.background, padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>{adminStories.length}</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Stories</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.background, padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#F59E0B' }}>
              {adminStories.filter((s: any) => s.viewsCount > 50).length}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Popular</Text>
          </View>
        </View>
      </View>

      {/* Stories List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />
        }
      >
        {isAdminStoriesLoading && !adminStories.length ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading stories...</Text>
          </View>
        ) : adminStories.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>No stories found</Text>
          </View>
        ) : (
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {adminStories.map((story: any) => (
                <View
                  key={story._id}
                  style={{
                    width: '48%',
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {/* Story Media */}
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: story.mediaUrl }}
                      style={{ width: '100%', height: 200 }}
                      resizeMode="cover"
                    />
                    
                    {/* Media Type Badge */}
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
                      <Ionicons
                        name={story.mediaType === 'video' ? 'videocam' : 'image'}
                        size={16}
                        color="white"
                      />
                    </View>

                    {/* User Info Overlay */}
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        padding: 8,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: '#3B82F6',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 6,
                          }}
                        >
                          <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
                            {story.userId?.firstName?.charAt(0).toUpperCase() || 'U'}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: 'white', flex: 1 }} numberOfLines={1}>
                          {story.userId?.firstName} {story.userId?.lastName}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Story Info */}
                  <View style={{ padding: 12 }}>
                    {story.caption && (
                      <Text style={{ fontSize: 12, color: colors.text, marginBottom: 8 }} numberOfLines={2}>
                        {story.caption}
                      </Text>
                    )}

                    {/* Stats */}
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="eye" size={14} color={colors.textSecondary} />
                        <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
                          {story.viewsCount || 0}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="heart" size={14} color="#EF4444" />
                        <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
                          {story.likesCount || 0}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 8 }}>
                      {new Date(story.createdAt).toLocaleDateString()}
                    </Text>

                    {/* Delete Button */}
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteStory(story._id, `${story.userId?.firstName} ${story.userId?.lastName}`)
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#EF4444',
                        paddingVertical: 8,
                        borderRadius: 6,
                      }}
                    >
                      <Ionicons name="trash-outline" size={14} color="white" />
                      <Text style={{ marginLeft: 4, color: 'white', fontSize: 12, fontWeight: '600' }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
