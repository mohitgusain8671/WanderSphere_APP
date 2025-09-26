import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../utils/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface StoryMediaFile {
  uri: string;
  type: string;
  name: string;
}

export default function AddStoryScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { createStory, isStoriesLoading } = useAppStore();
  const { showSuccess, showError } = useToast();

  const [selectedMedia, setSelectedMedia] = useState<StoryMediaFile | null>(null);
  const [caption, setCaption] = useState('');

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16], // Story aspect ratio
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setSelectedMedia({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
        name: asset.fileName || `story_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`
      });
    }
  };

  const handleCameraPicker = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setSelectedMedia({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
        name: asset.fileName || `story_camera_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`
      });
    }
  };

  const handleCreateStory = async () => {
    if (!selectedMedia) {
      showError('Please select a photo or video for your story');
      return;
    }

    const storyData = {
      mediaFile: selectedMedia,
      caption: caption.trim() || null
    };

    const result = await createStory(storyData);

    if (result.success) {
      showSuccess('Story created successfully!');
      router.back();
    } else {
      showError(result.error || 'Failed to create story');
    }
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setCaption('');
  };

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text 
          className="text-xl font-bold"
          style={{ color: colors.text }}
        >
          Add Story
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

      <View className="flex-1 px-6 py-6">
        {!selectedMedia ? (
          // Media Selection Screen
          <View className="flex-1 justify-center items-center">
            <View 
              className="w-48 h-80 rounded-3xl border-4 border-dashed items-center justify-center mb-8"
              style={{ borderColor: colors.border }}
            >
              <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
              <Text 
                className="text-lg font-semibold mt-4 mb-2"
                style={{ color: colors.text }}
              >
                Create Your Story
              </Text>
              <Text 
                className="text-sm text-center px-4"
                style={{ color: colors.textSecondary }}
              >
                Share a moment from your day with photos or videos
              </Text>
            </View>

            {/* Media Selection Buttons */}
            <View className="w-full space-y-4">
              <TouchableOpacity
                onPress={handleCameraPicker}
                className="flex-row items-center justify-center p-4 rounded-xl"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Ionicons name="camera" size={24} color="white" />
                <Text className="ml-3 text-white font-semibold text-lg">
                  Take Photo/Video
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleImagePicker}
                className="flex-row items-center justify-center p-4 rounded-xl border-2"
                style={{ 
                  backgroundColor: colors.surface,
                  borderColor: COLORS.primary
                }}
              >
                <Ionicons name="images" size={24} color={COLORS.primary} />
                <Text 
                  className="ml-3 font-semibold text-lg"
                  style={{ color: COLORS.primary }}
                >
                  Choose from Gallery
                </Text>
              </TouchableOpacity>
            </View>

            {/* Story Tips */}
            <View 
              className="mt-8 p-4 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <Text 
                className="font-semibold mb-2"
                style={{ color: colors.text }}
              >
                💡 Story Tips:
              </Text>
              <Text 
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                • Stories disappear after 24 hours{'\n'}
                • Use vertical photos/videos for best results{'\n'}
                • Add captions to share more context
              </Text>
            </View>
          </View>
        ) : (
          // Story Preview Screen
          <View className="flex-1">
            {/* Media Preview */}
            <View className="flex-1 items-center justify-center mb-6">
              <View 
                className="relative rounded-3xl overflow-hidden"
                style={{ 
                  width: screenWidth * 0.7,
                  height: screenHeight * 0.6,
                  backgroundColor: colors.surface
                }}
              >
                <Image 
                  source={{ uri: selectedMedia.uri }}
                  style={{ 
                    width: '100%',
                    height: '100%'
                  }}
                  resizeMode="cover"
                />
                
                {/* Remove Media Button */}
                <TouchableOpacity
                  onPress={removeMedia}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black bg-opacity-50 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>

                {/* Caption Overlay */}
                {caption && (
                  <View className="absolute bottom-4 left-4 right-4">
                    <View className="bg-black bg-opacity-50 rounded-lg p-3">
                      <Text className="text-white text-center font-medium">
                        {caption}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Media Type Indicator */}
                {selectedMedia.type.startsWith('video') && (
                  <View className="absolute top-4 left-4">
                    <View className="bg-black bg-opacity-50 rounded-full p-2">
                      <Ionicons name="play" size={16} color="white" />
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Caption Input */}
            <View className="mb-6">
              <Text 
                className="text-base font-semibold mb-3"
                style={{ color: colors.text }}
              >
                Add Caption (Optional)
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  className="flex-1 ml-3 p-4 rounded-xl text-base"
                  style={{ 
                    backgroundColor: colors.surface,
                    color: colors.text
                  }}
                  placeholder="What's happening?"
                  placeholderTextColor={colors.textSecondary}
                  value={caption}
                  onChangeText={setCaption}
                  maxLength={100}
                />
              </View>
              <Text 
                className="text-sm mt-2 text-right"
                style={{ color: colors.textSecondary }}
              >
                {caption.length}/100
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <Button
                title="Share Story"
                onPress={handleCreateStory}
                loading={isStoriesLoading}
                fullWidth
                variant="primary"
              />

              <Button
                title="Choose Different Media"
                onPress={removeMedia}
                fullWidth
                variant="outline"
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}