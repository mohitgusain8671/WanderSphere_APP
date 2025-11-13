import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface PerformanceMetricCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend: string;
}

export const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
}) => {
  const { colors } = useTheme();

  const getTrendColor = () => {
    if (title.includes('Error')) {
      return trend.startsWith('-') ? '#10B981' : '#EF4444';
    }
    return trend.startsWith('+') ? '#10B981' : '#EF4444';
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: `${color}20`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Ionicons name={icon as any} size={16} color={color} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
          {value}
        </Text>
        <Text style={{ fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginTop: 2 }}>
          {title}
        </Text>
        <Text
          style={{
            fontSize: 10,
            fontWeight: '600',
            color: getTrendColor(),
            marginTop: 2,
          }}
        >
          {trend}
        </Text>
      </View>
    </View>
  );
};
