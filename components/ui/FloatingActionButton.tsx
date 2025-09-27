import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
    Animated,
    Text,
    TouchableOpacity
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface FloatingActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onPress,
  color = '#3B82F6',
  size = 'medium',
  style
}) => {
  const { colors, isDarkMode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const sizes = {
    small: { width: 50, height: 50, iconSize: 20, fontSize: 10 },
    medium: { width: 60, height: 60, iconSize: 24, fontSize: 12 },
    large: { width: 70, height: 70, iconSize: 28, fontSize: 14 }
  };

  const currentSize = sizes[size];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={{
          width: currentSize.width,
          height: currentSize.height,
          borderRadius: currentSize.width / 2,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: color,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          borderWidth: 2,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <Ionicons 
          name={icon} 
          size={currentSize.iconSize} 
          color="white" 
        />
      </TouchableOpacity>
      {label && (
        <Text
          style={{
            textAlign: 'center',
            marginTop: 4,
            fontSize: currentSize.fontSize,
            fontWeight: '600',
            color: colors.text,
          }}
        >
          {label}
        </Text>
      )}
    </Animated.View>
  );
};