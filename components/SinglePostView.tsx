import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../store';
import { COLORS, USER_ROLES } from '../utils/constants';
import { CommentsScreen } from './CommentsScreen';
import { ImageCarousel } from './ui/ImageCarousel';
import { ProfileAvatar } from './ui/ProfileAvatar';

interface SinglePostViewProps {
  postId?: string;
  post?: any;
  visible: boolean;
  onClose: () => void;
  onUserPress?: (userId: string) => void;
}

const { width: screenWidth } = Dimensions.get("window");

export const SinglePostView: React.FC<SinglePostViewProps> = ({
  postId,
  post: initialPost,
  visible,
  onClose,
  onUserPress,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { user, getPostById, toggleLikePost, deletePost } = useAppStore();
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(!initialPost && !!postId);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (postId && !initialPost && visible) {
      loadPost();
    } else if (initialPost) {
      setPost(initialPost);
      setLoading(false);
    }
  }, [postId, initialPost, visible]);

  const loadPost = async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      const result = await getPostById(postId);
      
      if (result.success) {
        setPost(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load post');
        onClose();
      }
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLiking || !post) return;

    setIsLiking(true);
    try {
      const result = await toggleLikePost(post._id);
      if (result.success) {
        setPost({
          ...post,
          isLikedByCurrentUser: result.data.isLiked,
          likesCount: result.data.likesCount,
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = () => {
    if (!post || isDeleting) return;
    
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            const result = await deletePost(post._id);
            if (result.success) {
              Alert.alert('Success', 'Post deleted successfully');
              onClose();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete post');
            }
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Failed to delete post');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const canDelete = user?.role === USER_ROLES.ADMIN || post?.author._id === user?._id;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView 
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between p-4 border-b"
          style={{ 
            borderBottomColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
          }}
        >
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text
            className="text-lg font-bold"
            style={{ color: colors.text }}
          >
            Post
          </Text>
          
          {canDelete && post && (
            <TouchableOpacity 
              onPress={handleDelete} 
              className="p-2"
              disabled={isDeleting}
              style={{ opacity: isDeleting ? 0.5 : 1 }}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
              ) : (
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={COLORS.danger}
                />
              )}
            </TouchableOpacity>
          )}
          
          {!canDelete && <View style={{ width: 40 }} />}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="mt-4 text-base" style={{ color: colors.textSecondary }}>
              Loading post...
            </Text>
          </View>
        ) : post ? (
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View
              className="mx-4 my-4 p-4 rounded-xl"
              style={{ 
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                elevation: 2,
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              }}
            >
              {/* Author Header */}
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                  className="flex-row items-center flex-1"
                  onPress={() => onUserPress?.(post.author._id)}
                >
                  <View className="mr-3">
                    <ProfileAvatar 
                      size={48} 
                      userId={post.author._id}
                      style={{ backgroundColor: colors.background }}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-semibold text-lg"
                      style={{ color: colors.text }}
                    >
                      {post.author.firstName} {post.author.lastName}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Location */}
              {post.location && (
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-sm ml-1"
                    style={{ color: colors.textSecondary }}
                  >
                    {post.location.name || post.location.address}
                  </Text>
                </View>
              )}

              {/* Tagged Friends */}
              {post.taggedFriends && post.taggedFriends.length > 0 && (
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-sm ml-1"
                    style={{ color: colors.textSecondary }}
                  >
                    with{" "}
                    {post.taggedFriends
                      .map((friend: any) => `${friend.firstName} ${friend.lastName}`)
                      .join(", ")}
                  </Text>
                </View>
              )}

              {/* Description */}
              {post.description && (
                <View className="mb-4">
                  <Text className="text-base leading-6" style={{ color: colors.text }}>
                    {post.description}
                  </Text>
                </View>
              )}

              {/* Media */}
              {post.mediaFiles && post.mediaFiles.length > 0 && (
                <View className="mb-4">
                  <ImageCarousel mediaFiles={post.mediaFiles} />
                </View>
              )}

              {/* Actions */}
              <View 
                className="flex-row items-center justify-between pt-4"
                style={{ 
                  borderTopWidth: 1, 
                  borderTopColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
                }}
              >
                <View className="flex-row items-center">
                  {/* Like Button */}
                  <TouchableOpacity
                    onPress={handleLike}
                    className="flex-row items-center py-2 px-3 rounded-xl mr-4"
                    disabled={isLiking}
                    style={{
                      backgroundColor: post.isLikedByCurrentUser 
                        ? isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'
                        : isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(248, 250, 252, 0.8)',
                    }}
                  >
                    <Ionicons
                      name={post.isLikedByCurrentUser ? "heart" : "heart-outline"}
                      size={22}
                      color={post.isLikedByCurrentUser ? "#EF4444" : colors.textSecondary}
                    />
                    <Text
                      className="ml-2 text-base font-semibold"
                      style={{ 
                        color: post.isLikedByCurrentUser ? "#EF4444" : colors.textSecondary 
                      }}
                    >
                      {post.likesCount || 0}
                    </Text>
                  </TouchableOpacity>

                  {/* Comment Button */}
                  <TouchableOpacity
                    onPress={() => setShowComments(true)}
                    className="flex-row items-center py-2 px-3 rounded-xl mr-4"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(248, 250, 252, 0.8)',
                    }}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#3B82F6"
                    />
                    <Text
                      className="ml-2 text-base font-semibold"
                      style={{ color: "#3B82F6" }}
                    >
                      {post.commentsCount || 0}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Share Button */}
                <TouchableOpacity 
                  className="py-2 px-3 rounded-xl"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(248, 250, 252, 0.8)',
                  }}
                >
                  <Ionicons
                    name="share-outline"
                    size={22}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg" style={{ color: colors.textSecondary }}>
              Post not found
            </Text>
          </View>
        )}

        {/* Comments Modal */}
        {post && (
          <Modal
            visible={showComments}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <CommentsScreen
              postId={post._id}
              onClose={() => setShowComments(false)}
            />
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
};