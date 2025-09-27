import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { InfiniteScrollView } from '../../components/InfiniteScrollView';
import { SinglePostView } from '../../components/SinglePostView';
import { StoriesBar } from '../../components/StoriesBar';
import { StoryViewer } from '../../components/StoryViewer';

export default function HomeScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { storyGroups, getStories, getUnreadCount, user } = useAppStore();
  const [refreshingStories, setRefreshingStories] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStoryGroupIndex, setSelectedStoryGroupIndex] = useState(0);

  useEffect(() => {
    loadStories();
    getUnreadCount();
  }, []);

  const loadStories = async () => {
    setRefreshingStories(true);
    await getStories();
    setRefreshingStories(false);
  };

  const handleStoryPress = (storyGroup: any) => {
    const groupIndex = storyGroups.findIndex(group => group.author._id === storyGroup.author._id);
    setSelectedStoryGroupIndex(groupIndex >= 0 ? groupIndex : 0);
    setShowStoryViewer(true);
  };

  const handleAddStoryPress = () => {
    router.push('/(tabs)/add-story');
  };

  const handleAddPostPress = () => {
    router.push('/(tabs)/add-post');
  };

  const handlePostPress = (post: any) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleCommentPress = (post: any) => {
    console.log('View comments for post:', post._id);
    Alert.alert('Comments', `Viewing comments for ${post.author.firstName}'s post`);
  };

  const handleUserPress = (userId: string) => {
    console.log('View user profile:', userId);
  };

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: colors.background 
      }}
    >
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View 
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
          }}
        >
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: 16 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 6,
                height: 28,
                backgroundColor: '#10B981',
                borderRadius: 3,
                marginRight: 12,
              }} />
              <Text 
                style={{
                  fontSize: 24,
                  fontWeight: '800',
                  color: colors.text,
                  letterSpacing: -0.5,
                }}
              >
                🌍 WanderLands
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity 
                onPress={toggleTheme}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Ionicons 
                  name={isDarkMode ? 'sunny' : 'moon'} 
                  size={20} 
                  color={colors.text}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/notifications')}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stories Section */}
        {!refreshingStories && storyGroups.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 12, marginTop: 16 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
              }}>
                📸 Adventure Stories
              </Text>
            </View>
            <StoriesBar
              storyGroups={storyGroups}
              onStoryPress={handleStoryPress}
              onAddStoryPress={handleAddStoryPress}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          marginBottom: 20,
          gap: 12,
        }}>
          <TouchableOpacity
            onPress={handleAddPostPress}
            style={{
              flex: 1,
              backgroundColor: '#10B981',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 3,
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="add-circle" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontWeight: '600',
            }}>
              Share Post
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/explore')}
            style={{
              flex: 1,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
            }}
          >
            <Ionicons name="compass" size={20} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={{
              color: '#10B981',
              fontSize: 14,
              fontWeight: '600',
            }}>
              Explore
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Feed */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
          }}>
            🌟 Travel Feed
          </Text>
        </View>
        
        <View style={{ flex: 1, minHeight: 400 }}>
          <InfiniteScrollView
            onPostPress={handlePostPress}
            onCommentPress={handleCommentPress}
            onUserPress={handleUserPress}
          />
        </View>
      </ScrollView>

      {/* Single Post View Modal */}
      <SinglePostView
        post={selectedPost}
        visible={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setSelectedPost(null);
        }}
        onUserPress={handleUserPress}
      />

      {/* Story Viewer */}
      <StoryViewer
        visible={showStoryViewer}
        storyGroups={storyGroups}
        initialGroupIndex={selectedStoryGroupIndex}
        onClose={() => setShowStoryViewer(false)}
        onUserPress={handleUserPress}
      />
    </SafeAreaView>
  );
}