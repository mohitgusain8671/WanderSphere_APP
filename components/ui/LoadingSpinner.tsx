import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../utils/constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  fullScreen = false
}) => {
  const { colors } = useTheme();

  if (fullScreen) {
    return (
      <View 
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size={size} color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View className="items-center justify-center p-4">
      <ActivityIndicator size={size} color={COLORS.primary} />
    </View>
  );
};