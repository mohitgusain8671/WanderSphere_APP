import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Post {
  id: string;
  thumbnail?: string;
  type: 'photo' | 'video' | 'carousel';
  likesCount: number;
  commentsCount: number;
}

interface PostsGridHeaderProps {
  onCreatePost?: () => void;
}

type TabType = 'posts' | 'reels' | 'tagged';

export const PostsGridHeader: React.FC<PostsGridHeaderProps> = ({
  onCreatePost,
}) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  
  const tabs = [
    { key: 'posts', icon: 'grid-outline', activeIcon: 'grid' },
    { key: 'reels', icon: 'play-circle-outline', activeIcon: 'play-circle' },
    { key: 'tagged', icon: 'person-outline', activeIcon: 'person' },
  ] as const;

  const TabButton = ({ tab }: { tab: { key: TabType; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap } }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab.key)}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: activeTab === tab.key ? colors.text : 'transparent',
      }}
    >
      <Ionicons
        name={activeTab === tab.key ? tab.activeIcon : tab.icon}
        size={24}
        color={activeTab === tab.key ? colors.text : colors.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {tabs.map((tab) => (
        <TabButton key={tab.key} tab={tab} />
      ))}
    </View>
  );
};

interface PostItemProps {
  post: Post;
  onPress?: (post: Post) => void;
}

export const PostItem: React.FC<PostItemProps> = ({ post, onPress }) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const itemSize = (screenWidth - 48) / 3; // 3 columns with padding

  return (
    <TouchableOpacity
      onPress={() => onPress?.(post)}
      style={{
        width: itemSize,
        height: itemSize,
        backgroundColor: colors.surface,
        borderRadius: 4,
        marginRight: 2,
        marginBottom: 2,
        position: 'relative',
      }}
    >
      {/* Post thumbnail or placeholder */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.border,
          borderRadius: 4,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {post.thumbnail ? (
          <Image
            source={{ uri: post.thumbnail }}
            style={{
              width: '100%',
              height: '100%',
            }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons
            name={post.type === 'video' ? 'play' : 'image'}
            size={24}
            color={colors.textSecondary}
          />
        )}
      </View>

      {/* Post type indicator */}
      {post.type === 'carousel' && (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        >
          <Ionicons
            name="copy-outline"
            size={16}
            color="white"
          />
        </View>
      )}

      {post.type === 'video' && (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        >
          <Ionicons
            name="play"
            size={16}
            color="white"
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

interface EmptyStateProps {
  onCreatePost?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreatePost }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          borderWidth: 2,
          borderColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Ionicons
          name="camera-outline"
          size={32}
          color={colors.textSecondary}
        />
      </View>
      
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        No Posts Yet
      </Text>
      
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        Share your travel moments{'\n'}to start your journey
      </Text>

      <TouchableOpacity
        onPress={onCreatePost}
        style={{
          backgroundColor: '#3B82F6',
          paddingHorizontal: 24,
          paddingVertical: 10,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 14,
            fontWeight: '600',
          }}
        >
          Create Your First Post
        </Text>
      </TouchableOpacity>
    </View>
  );
};