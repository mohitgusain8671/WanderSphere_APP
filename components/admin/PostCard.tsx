import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface PostCardProps {
  post: {
    _id: string;
    description?: string;
    mediaFiles?: Array<{ url: string }>;
    userId?: {
      firstName: string;
      lastName: string;
    };
    likesCount?: number;
    commentsCount?: number;
    location?: {
      name: string;
    };
    createdAt: string;
  };
  onDelete: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* User Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#3B82F6',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            {post.userId?.firstName?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
            {post.userId?.firstName} {post.userId?.lastName}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Post Content */}
      {post.description && (
        <Text style={{ fontSize: 14, color: colors.text, marginBottom: 12 }} numberOfLines={3}>
          {post.description}
        </Text>
      )}

      {/* Post Media */}
      {post.mediaFiles && post.mediaFiles.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Image
            source={{ uri: post.mediaFiles[0].url }}
            style={{ width: '100%', height: 200, borderRadius: 8 }}
            resizeMode="cover"
          />
          {post.mediaFiles.length > 1 && (
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
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                +{post.mediaFiles.length - 1}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Post Stats */}
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="heart" size={16} color="#EF4444" />
          <Text style={{ marginLeft: 4, fontSize: 14, color: colors.textSecondary }}>
            {post.likesCount || 0}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chatbubble" size={16} color="#3B82F6" />
          <Text style={{ marginLeft: 4, fontSize: 14, color: colors.textSecondary }}>
            {post.commentsCount || 0}
          </Text>
        </View>
        {post.location && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location" size={16} color="#10B981" />
            <Text style={{ marginLeft: 4, fontSize: 14, color: colors.textSecondary }}>
              {post.location.name}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <TouchableOpacity
        onPress={onDelete}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#EF4444',
          paddingVertical: 10,
          borderRadius: 8,
        }}
      >
        <Ionicons name="trash-outline" size={18} color="white" />
        <Text style={{ marginLeft: 6, color: 'white', fontSize: 14, fontWeight: '600' }}>Delete Post</Text>
      </TouchableOpacity>
    </View>
  );
};
