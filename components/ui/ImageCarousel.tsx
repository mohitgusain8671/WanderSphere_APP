import { ResizeMode, Video } from 'expo-av';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface MediaFile {
  url: string;
  type?: string;
}

interface ImageCarouselProps {
  mediaFiles: MediaFile[];
  onPress?: () => void;
  onIndexChange?: (index: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  mediaFiles, 
  onPress, 
  onIndexChange 
}) => {
  const { colors, isDarkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const slideWidth = screenWidth - 16; // Snap interval width
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    if (index !== currentIndex && index >= 0 && index < mediaFiles.length) {
      setCurrentIndex(index);
      onIndexChange?.(index);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current && index >= 0 && index < mediaFiles.length) {
      const slideWidth = screenWidth - 16;
      scrollViewRef.current.scrollTo({ x: index * slideWidth, animated: true });
    }
  };

  const renderMediaItem = (mediaFile: MediaFile, index: number) => {
    const itemWidth = screenWidth - 64; // Account for PostCard container padding
    
    // Check if it's a video by type or file extension
    const isVideo = mediaFile.type === 'video' || 
                   mediaFile.url?.includes('.mp4') || 
                   mediaFile.url?.includes('.mov') || 
                   mediaFile.url?.includes('.avi') ||
                   mediaFile.url?.includes('.webm');

    if (isVideo) {
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
          shouldPlay={index === currentIndex} // Only play current video
          isLooping
          useNativeControls
          isMuted={false}
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
          ref={scrollViewRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={screenWidth - 16} // Account for container margin
          snapToAlignment="start"
          style={{ marginHorizontal: -16 }}
        >
          {mediaFiles.map((mediaFile, index) => (
            <View
              key={index}
              style={{
                width: screenWidth - 32,
                marginLeft: 16,
                marginRight: 16,
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
            style={{ width: '100%' }}
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