import { ResizeMode, Video } from 'expo-av';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ImageCarouselProps {
  mediaFiles: any[];
  onPress?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ mediaFiles, onPress }) => {
  const { colors, isDarkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const slideSize = screenWidth - 64; // Account for margins
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const renderMediaItem = (mediaFile: any, index: number) => {
    const itemWidth = screenWidth - 64;

    if (mediaFile.type === 'video') {
      return (
        <Video
          key={index}
          source={{ uri: mediaFile.url }}
          style={{
            width: itemWidth,
            height: 250,
            borderRadius: 12,
          }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping
          useNativeControls
        />
      );
    }

    return (
      <Image
        key={index}
        source={{ uri: mediaFile.url }}
        style={{
          width: itemWidth,
          height: 250,
          borderRadius: 12,
        }}
        resizeMode="cover"
      />
    );
  };

  if (mediaFiles.length === 0) return null;

  if (mediaFiles.length === 1) {
    return (
      <TouchableOpacity onPress={onPress} className="mb-3">
        {renderMediaItem(mediaFiles[0], 0)}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} className="mb-3">
      <View>
        {/* Instagram-style carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {mediaFiles.map((mediaFile, index) => (
            <View
              key={index}
              style={{
                width: screenWidth - 64,
                marginRight: index < mediaFiles.length - 1 ? 16 : 0, // 16px gap except last
              }}
            >
              {renderMediaItem(mediaFile, index)}
            </View>
          ))}
        </ScrollView>

        {/* Dots Indicator */}
        {mediaFiles.length > 1 && (
          <View
            className="flex-row justify-center absolute bottom-3"
            style={{ width: screenWidth - 64 }}
          >
            {mediaFiles.map((_, index) => (
              <View
                key={index}
                className="mx-1"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 
                    index === currentIndex 
                      ? '#3B82F6' 
                      : isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)',
                }}
              />
            ))}
          </View>
        )}

        {/* Image counter (Instagram style) */}
        {mediaFiles.length > 1 && (
          <View
            className="absolute top-3 right-3 px-3 py-1 rounded-full"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
          >
            <Text className="text-white text-xs font-semibold">
              {currentIndex + 1}/{mediaFiles.length}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};