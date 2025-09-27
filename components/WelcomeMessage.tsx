import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface WelcomeMessageProps {
  userName?: string;
  customMessage?: string;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ 
  userName = 'Explorer', 
  customMessage 
}) => {
  const { colors, isDarkMode } = useTheme();

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const defaultMessage = `Good ${getTimeBasedGreeting()}, ${userName}!`;

  return (
    <View style={{
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      marginTop: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#10B981',
    }}>
      <Text style={{
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
        lineHeight: 22,
      }}>
        {customMessage || defaultMessage}
      </Text>
      <Text style={{
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
        marginTop: 4,
      }}>
        Ready for your next adventure? ✈️
      </Text>
    </View>
  );
};