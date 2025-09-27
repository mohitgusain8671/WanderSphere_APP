import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ResizeMode, Video } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Share,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../store';
import { USER_ROLES } from '../utils/constants';
import { ProfileAvatar } from './ui/ProfileAvatar';

interface StoryViewerProps {
  visible: boolean;
  storyGroups: any[];
  initialGroupIndex?: number;
  initialStoryIndex?: number;
  onClose: () => void;
  onUserPress?: (userId: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const STORY_DURATION = 15000; // 15 seconds per story
const PROGRESS_UPDATE_INTERVAL = 100; // Update progress every 100ms

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  storyGroups,
  initialGroupIndex = 0,
  initialStoryIndex = 0,
  onClose,
  onUserPress,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { user, deleteStory, toggleLikeStory } = useAppStore();
  
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<Video>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories?.[currentStoryIndex];
  const canDelete = user?.role === USER_ROLES.ADMIN || currentStory?.author?._id === user?._id;

  // Reset progress and like state when story changes
  useEffect(() => {
    setProgress(0);
    setIsLoading(true);
    setShowReactions(false);
    
    // Initialize like state for current story
    if (currentStory) {
      const userLiked = currentStory.isLikedByCurrentUser || false;
      setIsLiked(userLiked);
      setLikesCount(currentStory.likesCount || 0);
    }
    
    // Small delay to allow media to load
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [currentGroupIndex, currentStoryIndex, currentStory, user?._id]);

  // Progress timer
  useEffect(() => {
    if (!visible || isPaused || isLoading) return;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (PROGRESS_UPDATE_INTERVAL / STORY_DURATION) * 100;
        
        if (newProgress >= 100) {
          nextStory();
          return 0;
        }
        
        return newProgress;
      });
    }, PROGRESS_UPDATE_INTERVAL);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [visible, isPaused, isLoading, currentGroupIndex, currentStoryIndex]);

  // Navigation functions
  const nextStory = useCallback(() => {
    if (!currentGroup) return;

    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  }, [currentGroup, currentStoryIndex, currentGroupIndex, storyGroups.length, onClose]);

  const previousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
      const previousGroup = storyGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(previousGroup.stories.length - 1);
    }
  }, [currentStoryIndex, currentGroupIndex, storyGroups]);

  const handleTap = useCallback((event: any) => {
    const { locationX } = event.nativeEvent;
    const middleX = screenWidth / 2;
    
    if (locationX < middleX) {
      previousStory();
    } else {
      nextStory();
    }
  }, [previousStory, nextStory]);

  const handleLongPressStart = useCallback(() => {
    setIsPaused(true);
    longPressTimerRef.current = setTimeout(() => {
      setIsPaused(true);
    }, 200);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    setIsPaused(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  }, []);

  const handleLike = useCallback(async () => {
    if (!currentStory || !user) return;

    try {
      const result = await toggleLikeStory(currentStory._id);
      if (result.success) {
        const { isLiked: newIsLiked, likesCount: newLikesCount } = result.data;
        setIsLiked(newIsLiked);
        setLikesCount(newLikesCount);
        
        // Show animation only when liking (not unliking)
        if (newIsLiked) {
          setShowLikeAnimation(true);
          setTimeout(() => setShowLikeAnimation(false), 1000);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to update story like');
      }
    } catch (error) {
      console.error('Error liking/unliking story:', error);
      Alert.alert('Error', 'Failed to update story like');
    }
  }, [currentStory, user, toggleLikeStory]);

  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      handleLike();
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1500);
    }
  }, [handleLike, isLiked]);

  const handleDelete = useCallback(() => {
    if (!currentStory || !canDelete) return;

    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteStory(currentStory._id);
              if (result.success) {
                // Move to next story or close if no more stories
                nextStory();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete story');
              }
            } catch (error) {
              console.error('Error deleting story:', error);
              Alert.alert('Error', 'Failed to delete story');
            }
          },
        },
      ]
    );
  }, [currentStory, canDelete, deleteStory, nextStory]);

  const handlePrevious = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  }, [currentStoryIndex]);

  const handleNext = useCallback(() => {
    if (currentGroup && currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // If at the end of current group, go to next group or close
      nextStory();
    }
  }, [currentStoryIndex, currentGroup, nextStory]);

  const handleShare = useCallback(async () => {
    if (!currentStory) return;
    
    try {
      const shareOptions = {
        message: `Check out this story by ${currentStory.author.username} on WanderSphere!`,
        url: currentStory.mediaFile.url,
        title: 'WanderSphere Story'
      };
      
      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing story:', error);
      Alert.alert('Error', 'Failed to share story');
    }
  }, [currentStory]);

  const handleReply = useCallback(() => {
    // For now, show an alert. In the future, this could open a comment modal
    Alert.alert(
      'Reply to Story',
      'Reply functionality will be implemented soon!',
      [{ text: 'OK' }]
    );
  }, []);

  const renderProgressBars = () => {
    if (!currentGroup) return null;

    return (
      <View className="flex-row px-4 pb-3">
        {currentGroup.stories.map((_: any, index: number) => (
          <View key={index} className="flex-1 mx-1">
            <View
              className="h-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: 'white',
                  width: `${
                    index < currentStoryIndex
                      ? 100
                      : index === currentStoryIndex
                      ? progress
                      : 0
                  }%`,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderStoryHeader = () => {
    if (!currentStory) return null;

    return (
      <View 
        className="flex-row items-center justify-between px-4 pb-3"
        style={{ backgroundColor: 'transparent' }}
      >
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={() => onUserPress?.(currentStory.author._id)}
        >
          <ProfileAvatar
            size={40}
            userId={currentStory.author._id}
            profilePicture={currentStory.author.profilePicture}
            style={{ marginRight: 12 }}
          />
          <View className="flex-1">
            <Text 
              className="text-white font-semibold text-base"
              style={{ 
                textShadowColor: 'rgba(0, 0, 0, 0.8)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 3
              }}
            >
              {currentStory.author.firstName} {currentStory.author.lastName}
            </Text>
            <Text 
              className="text-gray-200 text-sm"
              style={{ 
                textShadowColor: 'rgba(0, 0, 0, 0.8)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 3
              }}
            >
              {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center">
          {/* Like Counter */}
          {likesCount > 0 && (
            <View 
              className="flex-row items-center mr-3 px-2 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            >
              <Ionicons name="heart" size={16} color="#EF4444" />
              <Text className="text-white text-sm ml-1">{likesCount}</Text>
            </View>
          )}

          {/* Reactions Button */}
          <TouchableOpacity 
            onPress={() => setShowReactions(!showReactions)}
            className="p-2 mr-2"
            style={{
              borderRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}
          >
            <Ionicons name="happy-outline" size={20} color="white" />
          </TouchableOpacity>

          {canDelete && (
            <TouchableOpacity onPress={handleDelete} className="p-2 mr-2">
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={onClose} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStoryContent = () => {
    if (!currentStory) return null;

    const isVideo = currentStory.mediaFile?.type?.includes('video') ||
                   currentStory.mediaFile?.url?.includes('.mp4') ||
                   currentStory.mediaFile?.url?.includes('.mov');

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTap}
        onLongPress={handleLongPressStart}
        onPressOut={handleLongPressEnd}
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        {isVideo ? (
          <Video
            ref={videoRef}
            source={{ uri: currentStory.mediaFile.url }}
            style={{
              width: screenWidth,
              height: screenHeight,
              position: 'absolute',
              top: 0,
              left: 0
            }}
            resizeMode={ResizeMode.COVER}
            shouldPlay={!isPaused && visible}
            isLooping={false}
            useNativeControls={false}
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <Image
            source={{ uri: currentStory.mediaFile.url }}
            style={{
              width: screenWidth,
              height: screenHeight,
              position: 'absolute',
              top: 0,
              left: 0
            }}
            resizeMode="cover"
            onLoad={() => setIsLoading(false)}
          />
        )}

        {currentStory.caption && (
          <View className="absolute bottom-32 left-0 right-0 px-4">
            <Text className="text-white text-base text-center shadow-lg">
              {currentStory.caption}
            </Text>
          </View>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <View className="absolute inset-0 justify-center items-center bg-black bg-opacity-50">
            <Text className="text-white">Loading...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!visible || !currentGroup) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View className="flex-1 bg-black">
        {/* Background overlay for better contrast */}
        <View className="absolute inset-0 bg-black opacity-30 z-10" />
        <SafeAreaView className="flex-1 relative z-20">
          {/* Progress bars */}
          <View 
            className="absolute top-0 left-0 right-0 pt-1 z-30"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          >
            {renderProgressBars()}
          </View>

          {/* Story header */}
          <View 
            className="absolute top-12 left-0 right-0 z-30"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          >
            {renderStoryHeader()}
          </View>

          {/* Story content */}
          {renderStoryContent()}

          {/* Bottom Interaction Controls */}
          <View className="absolute bottom-0 left-0 right-0 pb-4">
            {/* Main Interaction Controls */}
            <View className="flex-row justify-center items-center px-6 py-3 mb-2">
              {/* Like Button */}
              <TouchableOpacity 
                onPress={handleLike}
                className="items-center mr-8"
                activeOpacity={0.7}
              >
                <View 
                  className="p-3 rounded-full"
                  style={{ 
                    backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    borderWidth: isLiked ? 2 : 0,
                    borderColor: '#EF4444'
                  }}
                >
                  <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={24} 
                    color={isLiked ? "#EF4444" : "white"} 
                  />
                </View>
                <Text className="text-white text-xs mt-1 font-medium">
                  {likesCount > 0 ? likesCount : 'Like'}
                </Text>
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity 
                className="items-center mr-8"
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <View 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                >
                  <Ionicons name="share-outline" size={24} color="white" />
                </View>
                <Text className="text-white text-xs mt-1">Share</Text>
              </TouchableOpacity>

              {/* Comment Button */}
              <TouchableOpacity 
                className="items-center"
                onPress={handleReply}
                activeOpacity={0.7}
              >
                <View 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="white" />
                </View>
                <Text className="text-white text-xs mt-1">Reply</Text>
              </TouchableOpacity>
            </View>

            {/* Navigation Controls */}
            <View className="flex-row justify-between items-center px-4 py-1">
              {/* Previous Story Button */}
              {currentStoryIndex > 0 && (
                <TouchableOpacity 
                  onPress={handlePrevious}
                  className="flex-row items-center px-4 py-2 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={20} color="white" />
                  <Text className="text-white text-sm ml-1">Previous</Text>
                </TouchableOpacity>
              )}

              <View className="flex-1" />

              {/* Story Counter */}
              {currentGroup && (
                <View 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                >
                  <Text className="text-white text-sm">
                    {currentStoryIndex + 1} / {currentGroup.stories.length}
                  </Text>
                </View>
              )}

              <View className="flex-1" />

              {/* Next Story Button */}
              {currentGroup && (currentStoryIndex < currentGroup.stories.length - 1) && (
                <TouchableOpacity 
                  onPress={handleNext}
                  className="flex-row items-center px-4 py-2 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-sm mr-1">Next</Text>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Reactions Modal */}
          {showReactions && (
            <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-4">
              <View className="flex-row justify-around items-center py-6">
                {['❤️', '😂', '😮', '😢', '😡', '👍'].map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      // Handle reaction
                      setShowReactions(false);
                    }}
                    className="p-3"
                  >
                    <Text style={{ fontSize: 32 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Like Animation */}
          {showLikeAnimation && (
            <View className="absolute inset-0 justify-center items-center pointer-events-none">
              <View className="items-center">
                <Ionicons name="heart" size={100} color="#EF4444" />
                <Text className="text-white text-lg font-bold mt-2 opacity-80">
                  Liked!
                </Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};