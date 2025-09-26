import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppStore } from "../../store";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";
import { COLORS } from "../../utils/constants";

interface MediaFile {
  uri: string;
  type: string;
  name: string;
}

interface LocationData {
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export default function AddPostScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { createPost, isPostsLoading, friends, getFriends } = useAppStore();
  const { showSuccess, showError } = useToast();

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<LocationData>({ name: "" });
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showFriendsList, setShowFriendsList] = useState(false);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera roll permissions to add photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      const newMedia: MediaFile[] = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: asset.type === "video" ? "video/mp4" : "image/jpeg",
        name:
          asset.fileName ||
          `media_${Date.now()}_${index}.${
            asset.type === "video" ? "mp4" : "jpg"
          }`,
      }));
      setSelectedMedia((prev) => [...prev, ...newMedia].slice(0, 5)); // Max 5 media files
    }
  };

  const handleCameraPicker = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera permissions to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const newMedia: MediaFile = {
        uri: asset.uri,
        type: asset.type === "video" ? "video/mp4" : "image/jpeg",
        name:
          asset.fileName ||
          `camera_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
      };
      setSelectedMedia((prev) => [...prev, newMedia].slice(0, 5));
    }
  };

  const removeMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFriendTag = (friendId: string) => {
    setTaggedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  React.useEffect(() => {
    if (showFriendsList && friends.length === 0) {
      getFriends();
    }
  }, [showFriendsList]);

  const handleCreatePost = async () => {
    if (!description.trim() && selectedMedia.length === 0) {
      showError("Please add some content or media to your post");
      return;
    }

    const postData = {
      description: description.trim(),
      location: location.name.trim() ? location : null,
      mediaFiles: selectedMedia,
      taggedFriends: taggedFriends.length > 0 ? taggedFriends : null,
    };

    const result = await createPost(postData);

    if (result.success) {
      showSuccess("Post created successfully!");
      router.back();
    } else {
      showError(result.error || "Failed to create post");
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-6 py-4 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Create Post
        </Text>

        <TouchableOpacity
          onPress={toggleTheme}
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons
            name={isDarkMode ? "sunny" : "moon"}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Description Input */}
        <View className="mb-6">
          <Text
            className="text-base font-semibold mb-3"
            style={{ color: colors.text }}
          >
            What's on your mind?
          </Text>
          <TextInput
            className="p-4 rounded-xl text-base min-h-[120px]"
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              textAlignVertical: "top",
            }}
            placeholder="Share your travel experience..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
          />
          <Text
            className="text-sm mt-2 text-right"
            style={{ color: colors.textSecondary }}
          >
            {description.length}/500
          </Text>
        </View>

        {/* Location Input */}
        <View className="mb-6">
          <Text
            className="text-base font-semibold mb-3"
            style={{ color: colors.text }}
          >
            Location (Optional)
          </Text>
          <View className="flex-row items-center">
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              className="flex-1 ml-3 p-4 rounded-xl text-base"
              style={{
                backgroundColor: colors.surface,
                color: colors.text,
              }}
              placeholder="Where are you?"
              placeholderTextColor={colors.textSecondary}
              value={location.name}
              onChangeText={(text) => setLocation({ ...location, name: text })}
            />
          </View>
        </View>

        {/* Media Section */}
        <View className="mb-6">
          <Text
            className="text-base font-semibold mb-3"
            style={{ color: colors.text }}
          >
            Photos & Videos ({selectedMedia.length}/5)
          </Text>

          {/* Media Grid */}
          {selectedMedia.length > 0 && (
            <View className="flex-row flex-wrap mb-4">
              {selectedMedia.map((media, index) => (
                <View key={index} className="relative mr-2 mb-2">
                  <Image
                    source={{ uri: media.uri }}
                    className="w-20 h-20 rounded-lg"
                  />
                  {media.type.startsWith("video") && (
                    <View className="absolute inset-0 items-center justify-center">
                      <View className="bg-black bg-opacity-50 rounded-full p-2">
                        <Ionicons name="play" size={16} color="white" />
                      </View>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => removeMedia(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add Media Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleImagePicker}
              className="flex-1 flex-row items-center justify-center p-4 rounded-xl border-2 border-dashed"
              style={{ borderColor: colors.border }}
              disabled={selectedMedia.length >= 5}
            >
              <Ionicons
                name="images-outline"
                size={24}
                color={
                  selectedMedia.length >= 5
                    ? colors.textSecondary
                    : COLORS.primary
                }
              />
              <Text
                className="ml-2 font-medium"
                style={{
                  color:
                    selectedMedia.length >= 5
                      ? colors.textSecondary
                      : COLORS.primary,
                }}
              >
                Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCameraPicker}
              className="flex-1 flex-row items-center justify-center p-4 rounded-xl border-2 border-dashed"
              style={{ borderColor: colors.border }}
              disabled={selectedMedia.length >= 5}
            >
              <Ionicons
                name="camera-outline"
                size={24}
                color={
                  selectedMedia.length >= 5
                    ? colors.textSecondary
                    : COLORS.secondary
                }
              />
              <Text
                className="ml-2 font-medium"
                style={{
                  color:
                    selectedMedia.length >= 5
                      ? colors.textSecondary
                      : COLORS.secondary,
                }}
              >
                Camera
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tagged Friends */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className="text-base font-semibold"
              style={{ color: colors.text }}
            >
              Tag Friends ({taggedFriends.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowFriendsList(!showFriendsList)}
              className="flex-row items-center p-2 rounded-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons
                name="person-add-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text
                className="ml-2 font-medium"
                style={{ color: COLORS.primary }}
              >
                {showFriendsList ? "Hide" : "Add"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tagged Friends Display */}
          {taggedFriends.length > 0 && (
            <View className="flex-row flex-wrap mb-3">
              {taggedFriends.map((friendId) => {
                const friend = friends.find((f) => f._id === friendId);
                return friend ? (
                  <View
                    key={friendId}
                    className="flex-row items-center bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2"
                  >
                    <Text className="text-blue-800 font-medium">
                      {friend.firstName} {friend.lastName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleFriendTag(friendId)}
                      className="ml-2"
                    >
                      <Ionicons name="close" size={16} color="#1e40af" />
                    </TouchableOpacity>
                  </View>
                ) : null;
              })}
            </View>
          )}

          {/* Friends List */}
          {showFriendsList && (
            <View
              className="max-h-40 rounded-xl p-3"
              style={{ backgroundColor: colors.surface }}
            >
              <FlatList
                data={friends}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => toggleFriendTag(item._id)}
                    className="flex-row items-center py-2"
                  >
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: colors.background }}
                    >
                      <Text
                        className="font-semibold"
                        style={{ color: colors.text }}
                      >
                        {item.firstName[0]}
                        {item.lastName[0]}
                      </Text>
                    </View>
                    <Text
                      className="flex-1 font-medium"
                      style={{ color: colors.text }}
                    >
                      {item.firstName} {item.lastName}
                    </Text>
                    {taggedFriends.includes(item._id) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>

        {/* Create Post Button */}
        <Button
          title="Share Post"
          onPress={handleCreatePost}
          loading={isPostsLoading}
          fullWidth
          variant="primary"
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
