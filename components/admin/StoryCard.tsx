import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface StoryCardProps {
  story: {
    _id: string;
    mediaUrl: string;
    mediaType: string;
    caption?: string;
    userId?: {
      firstName: string;
      lastName: string;
    };
    viewsCount?: number;
    likesCount?: number;
    createdAt: string;
  };
  onDelete: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onDelete }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: '48%',
        backgroundColor: colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Story Media */}
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: story.mediaUrl }} style={{ width: '100%', height: 200 }} resizeMode="cover" />

        {/* Media Type Badge */}
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.6)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Ionicons name={story.mediaType === 'video' ? 'videocam' : 'image'} size={16} color="white" />
        </View>

        {/* User Info Overlay */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#3B82F6',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 6,
              }}
            >
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
                {story.userId?.firstName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: 'white', flex: 1 }} numberOfLines={1}>
              {story.userId?.firstName} {story.userId?.lastName}
            </Text>
          </View>
        </View>
      </View>

      {/* Story Info */}
      <View style={{ padding: 12 }}>
        {story.caption && (
          <Text style={{ fontSize: 12, color: colors.text, marginBottom: 8 }} numberOfLines={2}>
            {story.caption}
          </Text>
        )}

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="eye" size={14} color={colors.textSecondary} />
            <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
              {story.viewsCount || 0}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="heart" size={14} color="#EF4444" />
            <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
              {story.likesCount || 0}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 8 }}>
          {new Date(story.createdAt).toLocaleDateString()}
        </Text>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={onDelete}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#EF4444',
            paddingVertical: 8,
            borderRadius: 6,
          }}
        >
          <Ionicons name="trash-outline" size={14} color="white" />
          <Text style={{ marginLeft: 4, color: 'white', fontSize: 12, fontWeight: '600' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
