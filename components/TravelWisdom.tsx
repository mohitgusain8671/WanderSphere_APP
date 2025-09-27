import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../store';
import { TRAVEL_TIPS } from '../utils/constants';

interface TravelWisdomProps {
  customTip?: { tip: string; author: string };
}

export const TravelWisdom: React.FC<TravelWisdomProps> = ({ customTip }) => {
  const { colors, isDarkMode } = useTheme();
  const { adventureTip } = useAppStore();
  
  // Use custom tip or AI-generated tip or fallback to random tip from constants
  const selectedTip = customTip || 
    (adventureTip ? { tip: adventureTip.tip, author: 'AI Travel Guide' } : null) ||
    TRAVEL_TIPS[Math.floor(Math.random() * TRAVEL_TIPS.length)];

  return (
    <View style={{ 
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: 16,
      padding: 20,
    }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 12,
      }}>
        <Ionicons name="bulb-outline" size={20} color="#10B981" style={{ marginRight: 8 }} />
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        }}>
          Travel Wisdom
        </Text>
      </View>
      
      <View>
        <Text style={{
          fontSize: 15,
          color: colors.text,
          fontWeight: '500',
          lineHeight: 22,
          marginBottom: 8,
          fontStyle: 'italic',
        }}>
          "{selectedTip.tip}"
        </Text>
        <Text style={{
          fontSize: 12,
          color: colors.textSecondary,
          fontWeight: '500',
          textAlign: 'right',
        }}>
          — {selectedTip.author}
        </Text>
      </View>
    </View>
  );
};