import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  onPostsPress?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  postsCount,
  followersCount,
  followingCount,
  onPostsPress,
  onFollowersPress,
  onFollowingPress,
}) => {
  const { colors } = useTheme();

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const StatItem = ({ 
    count, 
    label, 
    onPress 
  }: { 
    count: number; 
    label: string; 
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={{ alignItems: 'center', flex: 1 }}
      disabled={!onPress}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
        }}
      >
        {formatCount(count)}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
      }}
    >
      <StatItem 
        count={postsCount} 
        label="Posts" 
        onPress={onPostsPress}
      />
      <StatItem 
        count={followersCount} 
        label="Followers" 
        onPress={onFollowersPress}
      />
      <StatItem 
        count={followingCount} 
        label="Following" 
        onPress={onFollowingPress}
      />
    </View>
  );
};