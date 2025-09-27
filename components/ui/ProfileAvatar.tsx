import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, View, ViewStyle } from 'react-native';
import { useAppStore } from '../../store';

interface ProfileAvatarProps {
  size?: number;
  userId?: string;
  profilePicture?: string | null;
  style?: ViewStyle;
  borderWidth?: number;
  borderColor?: string;
  showDefaultIcon?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  size = 40,
  userId,
  profilePicture: propProfilePicture,
  style,
  borderWidth = 0,
  borderColor = '#3B82F6',
  showDefaultIcon = true,
}) => {
  const { user } = useAppStore();
  
  // Determine which profile picture to use
  let profilePicture: string | null = null;
  
  if (propProfilePicture !== undefined) {
    // Use the provided profile picture prop
    profilePicture = propProfilePicture;
  } else {
    // Fallback to current user's profile picture if userId matches or no userId provided
    const isCurrentUser = !userId || userId === user?._id;
    profilePicture = isCurrentUser ? user?.profilePicture : null;
  }

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