import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${color}20`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        {trend && (
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: trend.startsWith('+') ? '#10B981' : '#EF4444',
              backgroundColor: trend.startsWith('+') ? '#10B98120' : '#EF444420',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            {trend}
          </Text>
        )}
      </View>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textSecondary }}>{title}</Text>
    </View>
  );
};
