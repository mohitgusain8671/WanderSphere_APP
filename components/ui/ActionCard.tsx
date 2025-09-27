import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
    Animated,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  color?: string;
  variant?: 'default' | 'gradient' | 'outlined';
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  color = '#3B82F6',
  variant = 'default'
}) => {
  const { colors, isDarkMode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  const getCardStyles = () => {
    switch (variant) {
      case 'gradient':
        return {
          backgroundColor: color,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: color,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'gradient') return 'white';
    if (variant === 'outlined') return color;
    return colors.text;
  };

  const getSubtitleColor = () => {
    if (variant === 'gradient') return 'rgba(255, 255, 255, 0.8)';
    if (variant === 'outlined') return color;
    return colors.textSecondary;
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 16,
            marginBottom: 12,
            elevation: variant === 'default' ? 2 : 8,
            shadowColor: variant === 'gradient' ? color : '#000000',
            shadowOffset: {
              width: 0,
              height: variant === 'gradient' ? 4 : 2,
            },
            shadowOpacity: variant === 'gradient' ? 0.3 : 0.1,
            shadowRadius: variant === 'gradient' ? 8 : 4,
          },
          getCardStyles()
        ]}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: variant === 'gradient' 
              ? 'rgba(255, 255, 255, 0.2)' 
              : variant === 'outlined'
              ? `${color}15`
              : `${color}15`,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
          }}
        >
          <Ionicons
            name={icon}
            size={24}
            color={variant === 'gradient' ? 'white' : color}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: getTextColor(),
              marginBottom: 2,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: getSubtitleColor(),
              lineHeight: 18,
            }}
          >
            {subtitle}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={variant === 'gradient' ? 'white' : colors.textSecondary}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};