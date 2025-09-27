import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ResizeMode, Video } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
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
  const { user, deleteStory } = useAppStore();
  
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<Video>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories?.[currentStoryIndex];
  const canDelete = user?.role === USER_ROLES.ADMIN || currentStory?.author?._id === user?._id;

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    setIsLoading(true);
    
    // Small delay to allow media to load
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [currentGroupIndex, currentStoryIndex]);

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

  const renderProgressBars = () => {
    if (!currentGroup) return null;

    return (
      <View className="flex-row px-4 pb-3">
        {currentGroup.stories.map((_, index) => (
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
      <View className="flex-row items-center justify-between px-4 pb-3">
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
            <Text className="text-white font-semibold text-base">
              {currentStory.author.firstName} {currentStory.author.lastName}
            </Text>
            <Text className="text-gray-200 text-sm">
              {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center">
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
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 80, // Leave space for header
          paddingBottom: 40
        }}
      >
        {isVideo ? (
          <Video
            ref={videoRef}
            source={{ uri: currentStory.mediaFile.url }}
            style={{
              width: screenWidth,
              height: screenHeight,
            }}
            resizeMode={ResizeMode.CONTAIN}
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
            }}
            resizeMode="contain"
            onLoad={() => setIsLoading(false)}
          />
        )}

        {currentStory.caption && (
          <View className="absolute bottom-20 left-0 right-0 px-4">
            <Text className="text-white text-base text-center">
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
        <SafeAreaView className="flex-1">
          {/* Progress bars */}
          <View className="pt-3">
            {renderProgressBars()}
          </View>

          {/* Story header */}
          {renderStoryHeader()}

          {/* Story content */}
          {renderStoryContent()}
        </SafeAreaView>
      </View>
    </Modal>
  );
};