import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, View, ViewStyle } from 'react-native';
import { useAppStore } from '../../store';

interface ProfileAvatarProps {
  size?: number;
  userId?: string;
  style?: ViewStyle;
  borderWidth?: number;
  borderColor?: string;
  showDefaultIcon?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  size = 40,
  userId,
  style,
  borderWidth = 0,
  borderColor = '#3B82F6',
  showDefaultIcon = true,
}) => {
  const { user } = useAppStore();
  
  // Use current user's profile picture if no userId specified, or if userId matches current user
  const isCurrentUser = !userId || userId === user?._id;
  const profilePicture = isCurrentUser ? user?.profilePicture : null;

  const avatarStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth,
    borderColor,
    overflow: 'hidden',
    ...style,
  };

  return (
    <View style={avatarStyle}>
      {profilePicture ? (
        <Image
          source={{ uri: profilePicture }}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
        />
      ) : showDefaultIcon ? (
        <Ionicons
          name="person"
          size={size * 0.5}
          color="white"
        />
      ) : (
        <Ionicons
          name="airplane"
          size={size * 0.4}
          color="white"
        />
      )}
    </View>
  );
};