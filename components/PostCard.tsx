import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAppStore } from "../store";
import { formatDistanceToNow } from "date-fns";
import { ResizeMode, Video } from "expo-av";
import { COLORS } from "../utils/constants";

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
  const { colors } = useTheme();
  const { toggleLikePost, user } = useAppStore();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

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

  const canDelete = user?.role === "admin" || post.author._id === user?.id;

  const truncatedDescription =
    post.description && post.description.length > MAX_DESCRIPTION_LENGTH
      ? post.description.substring(0, MAX_DESCRIPTION_LENGTH) + "..."
      : post.description;

  const shouldTruncate =
    post.description && post.description.length > MAX_DESCRIPTION_LENGTH;

  const renderMediaItem = (mediaFile: any, index: number) => {
    if (mediaFile.type === "video") {
      return (
        <Video
          key={index}
          source={{ uri: mediaFile.url }}
          style={{
            width: screenWidth - 32,
            height: 250,
            borderRadius: 12,
            marginRight: index < post.mediaFiles.length - 1 ? 8 : 0,
          }}
          resizeMode={ResizeMode.COVER}
          useNativeControls
          shouldPlay={false}
        />
      );
    } else {
      return (
        <Image
          key={index}
          source={{ uri: mediaFile.url }}
          style={{
            width: screenWidth - 32,
            height: 250,
            borderRadius: 12,
            marginRight: index < post.mediaFiles.length - 1 ? 8 : 0,
          }}
          resizeMode="cover"
        />
      );
    }
  };

  return (
    <View
      className="mb-4 p-4 rounded-xl"
      style={{ backgroundColor: colors.surface }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={() => onUserPress?.(post.author._id)}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.background }}
          >
            {post.author.profilePicture ? (
              <Image
                source={{ uri: post.author.profilePicture }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <Ionicons name="person" size={20} color={colors.text} />
            )}
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
        <TouchableOpacity onPress={onPress} className="mb-3">
          <View className="flex-row">
            {post.mediaFiles.map((mediaFile: any, index: number) =>
              renderMediaItem(mediaFile, index)
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Actions */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity
            onPress={handleLike}
            className="flex-row items-center"
            disabled={isLiking}
          >
            <Ionicons
              name={post.isLikedByCurrentUser ? "heart" : "heart-outline"}
              size={24}
              color={
                post.isLikedByCurrentUser ? "#EF4444" : colors.textSecondary
              }
            />
            <Text
              className="ml-2 text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              {post.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCommentPress}
            className="flex-row items-center"
          >
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={colors.textSecondary}
            />
            <Text
              className="ml-2 text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              {post.commentsCount}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="p-2">
          <Ionicons
            name="share-outline"
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
