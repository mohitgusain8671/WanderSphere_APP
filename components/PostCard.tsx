import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAppStore } from "../store";
import { COLORS, USER_ROLES } from "../utils/constants";
import { CommentsScreen } from "./CommentsScreen";
import { ImageCarousel } from "./ui/ImageCarousel";
import { ProfileAvatar } from "./ui/ProfileAvatar";

interface PostCardProps {
  post: any;
  onPress?: () => void;
  onCommentPress?: () => void;
  onUserPress?: (userId: string) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const MAX_DESCRIPTION_LENGTH = 100;

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onCommentPress,
  onUserPress,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { toggleLikePost, user } = useAppStore();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      await toggleLikePost(post._id);
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await useAppStore.getState().deletePost(post._id);
          } catch (error) {
            console.error("Error deleting post:", error);
          }
        },
      },
    ]);
  };

  const canDelete = user?.role === USER_ROLES.ADMIN || post.author._id === user?._id;

  const truncatedDescription =
    post.description && post.description.length > MAX_DESCRIPTION_LENGTH
      ? post.description.substring(0, MAX_DESCRIPTION_LENGTH) + "..."
      : post.description;

  const shouldTruncate =
    post.description && post.description.length > MAX_DESCRIPTION_LENGTH;

  return (
    <View
      className="mb-4 mx-4 p-4 rounded-xl"
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
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={() => onUserPress?.(post.author._id)}
        >
          <View className="mr-3">
            <ProfileAvatar 
              size={40} 
              userId={post.author._id}
              style={{ backgroundColor: colors.background }}
            />
          </View>
          <View className="flex-1">
            <Text
              className="font-semibold text-base"
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

        {canDelete && (
          <TouchableOpacity onPress={handleDelete} className="p-2">
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      {post.description && (
        <TouchableOpacity
          onPress={() =>
            shouldTruncate
              ? setShowFullDescription(!showFullDescription)
              : onPress?.()
          }
          className="mb-3"
        >
          <Text className="text-base leading-5" style={{ color: colors.text }}>
            {showFullDescription ? post.description : truncatedDescription}
          </Text>
          {shouldTruncate && (
            <Text
              className="text-sm mt-1 font-medium"
              style={{ color: COLORS.primary }}
            >
              {showFullDescription ? "Show less" : "Read more"}
            </Text>
          )}
        </TouchableOpacity>
      )}

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

      {/* Media */}
      {post.mediaFiles && post.mediaFiles.length > 0 && (
        <ImageCarousel 
          mediaFiles={post.mediaFiles}
          onPress={onPress}
        />
      )}

      {/* Actions */}
      <View 
        className="flex-row items-center justify-between pt-4 mt-2"
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
              size={20}
              color={post.isLikedByCurrentUser ? "#EF4444" : colors.textSecondary}
            />
            <Text
              className="ml-2 text-sm font-semibold"
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
              size={18}
              color="#3B82F6"
            />
            <Text
              className="ml-2 text-sm font-semibold"
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
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Comments Modal */}
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
    </View>
  );
};
