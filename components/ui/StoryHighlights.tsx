import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface StoryHighlight {
  id: string;
  title: string;
  thumbnail?: string;
  count: number;
}

interface StoryHighlightsProps {
  highlights: StoryHighlight[];
  onHighlightPress?: (highlight: StoryHighlight) => void;
  onAddHighlight?: () => void;
}

export const StoryHighlights: React.FC<StoryHighlightsProps> = ({
  highlights = [],
  onHighlightPress,
  onAddHighlight,
}) => {
  const { colors, isDarkMode } = useTheme();

  const HighlightItem = ({ 
    highlight, 
    isAddButton = false 
  }: { 
    highlight?: StoryHighlight; 
    isAddButton?: boolean;
  }) => (
    <TouchableOpacity
      onPress={isAddButton ? onAddHighlight : () => onHighlightPress?.(highlight!)}
      style={{
        alignItems: 'center',
        marginRight: 16,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: isAddButton 
            ? isDarkMode 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.05)'
            : colors.surface,
          borderWidth: isAddButton ? 2 : 1.5,
          borderColor: isAddButton 
            ? isDarkMode 
              ? 'rgba(255, 255, 255, 0.3)' 
              : 'rgba(0, 0, 0, 0.2)'
            : '#3B82F6',
          borderStyle: isAddButton ? 'dashed' : 'solid',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        {isAddButton ? (
          <Ionicons
            name="add"
            size={24}
            color={colors.textSecondary}
          />
        ) : (
          <Ionicons
            name="camera"
            size={28}
            color="#3B82F6"
          />
        )}
      </View>
      
      <Text
        style={{
          fontSize: 12,
          fontWeight: '500',
          color: colors.text,
          textAlign: 'center',
          maxWidth: 64,
        }}
        numberOfLines={1}
      >
        {isAddButton ? 'New' : highlight?.title}
      </Text>
    </TouchableOpacity>
  );

  if (highlights.length === 0) {
    return (
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingRight: 16,
          }}
        >
          <HighlightItem isAddButton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: 16,
        }}
      >
        <HighlightItem isAddButton />
        {highlights.map((highlight) => (
          <HighlightItem
            key={highlight.id}
            highlight={highlight}
          />
        ))}
      </ScrollView>
    </View>
  );
};