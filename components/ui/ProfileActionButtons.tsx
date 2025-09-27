import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfileActionButtonsProps {
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onEditProfile?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
  onMenu?: () => void;
}

export const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({
  isOwnProfile = true,
  isFollowing = false,
  onEditProfile,
  onFollow,
  onMessage,
  onShare,
  onMenu,
}) => {
  const { colors, isDarkMode } = useTheme();

  const ActionButton = ({ 
    title, 
    onPress, 
    variant = 'outline',
    icon,
    flex = 1 
  }: { 
    title?: string; 
    onPress?: () => void; 
    variant?: 'primary' | 'outline' | 'icon';
    icon?: keyof typeof Ionicons.glyphMap;
    flex?: number;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex,
        backgroundColor: 
          variant === 'primary' 
            ? '#3B82F6' 
            : variant === 'icon'
            ? 'transparent'
            : isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        borderRadius: variant === 'icon' ? 12 : 8,
        paddingVertical: variant === 'icon' ? 8 : 10,
        paddingHorizontal: variant === 'icon' ? 8 : 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
      }}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={20}
          color={variant === 'primary' ? 'white' : colors.text}
        />
      ) : (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: variant === 'primary' ? 'white' : colors.text,
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (isOwnProfile) {
    return (
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <ActionButton
          title="Edit Profile"
          onPress={onEditProfile}
          variant="outline"
          flex={3}
        />
        <ActionButton
          title="Share Profile"
          onPress={onShare}
          variant="outline"
          flex={3}
        />
        <ActionButton
          icon="menu"
          onPress={onMenu}
          variant="icon"
          flex={1}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
      <ActionButton
        title={isFollowing ? 'Following' : 'Follow'}
        onPress={onFollow}
        variant={isFollowing ? 'outline' : 'primary'}
        flex={3}
      />
      <ActionButton
        title="Message"
        onPress={onMessage}
        variant="outline"
        flex={3}
      />
      <ActionButton
        icon="person-add"
        onPress={() => {}}
        variant="icon"
        flex={1}
      />
      <ActionButton
        icon="ellipsis-horizontal"
        onPress={onMenu}
        variant="icon"
        flex={1}
      />
    </View>
  );
};