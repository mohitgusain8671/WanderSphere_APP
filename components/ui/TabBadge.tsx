import React from 'react';
import { Text, View } from 'react-native';

interface TabBadgeProps {
  count: number;
  color?: string;
}

export const TabBadge: React.FC<TabBadgeProps> = ({ count, color = '#EF4444' }) => {
  if (count <= 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        right: -6,
        top: -3,
        backgroundColor: color,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: count > 99 ? 8 : 10,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};