import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppStore } from "../../store";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  showAvatar?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = false,
  onPress,
  onLongPress,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAppStore();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const handleDownloadFile = async (file: any) => {
    try {
      Alert.alert(
        "Download File",
        `Do you want to download ${file.fileName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Download",
            onPress: async () => {
              try {
                // For images and videos, try to save to media library first
                if (file.type === "image" || file.type === "video") {
                  const { status } =
                    await MediaLibrary.requestPermissionsAsync();
                  if (status === "granted") {
                    try {
                      await MediaLibrary.saveToLibraryAsync(file.url);
                      Alert.alert(
                        "Success",
                        `${file.fileName} saved to gallery!`
                      );
                      return;
                    } catch (error) {
                      // If direct save fails, fall through to sharing
                    }
                  }
                }

                // Use sharing for all files (fallback and primary method for documents)
                const canShare = await Sharing.isAvailableAsync();
                if (canShare) {
                  await Sharing.shareAsync(file.url, {
                    mimeType: file.mimeType || "application/octet-stream",
                    dialogTitle: `Save ${file.fileName}`,
                  });
                } else {
                  // Last resort - open in browser/default app
                  Alert.alert(
                    "Download",
                    "Opening file in default app. You can save it from there.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Open",
                        onPress: () => {
                          Linking.openURL(file.url).catch(() => {
                            Alert.alert("Error", "Cannot open this file.");
                          });
                        },
                      },
                    ]
                  );
                }
              } catch (error) {
                Alert.alert(
                  "Error",
                  "Failed to download file. Please try again."
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to initiate download.");
    }
  };

  const renderMediaFiles = () => {
    if (!message.mediaFiles || message.mediaFiles.length === 0) return null;

    return (
      <View style={{ marginBottom: message.content ? 8 : 0 }}>
        {message.mediaFiles.map((file: any, index: number) => (
          <View
            key={index}
            style={{
              marginBottom: index < message.mediaFiles.length - 1 ? 8 : 0,
            }}
          >
            {file.type === "image" ? (
              <TouchableOpacity onPress={() => handleImagePress(file.url)}>
                <Image
                  source={{ uri: file.url }}
                  style={{
                    width: 200,
                    height: 150,
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    borderRadius: 12,
                    padding: 4,
                  }}
                >
                  <Ionicons name="expand" size={12} color="white" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => handleDownloadFile(file)}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                    borderRadius: 8,
                    padding: 12,
                    minWidth: 150,
                  }}
                >
                  <Ionicons
                    name={
                      file.type === "video"
                        ? "videocam"
                        : file.type === "audio"
                        ? "musical-notes"
                        : "document"
                    }
                    size={20}
                    color={colors.text}
                  />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.text,
                      }}
                      numberOfLines={1}
                    >
                      {file.fileName}
                    </Text>
                    {file.fileSize && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textSecondary,
                        }}
                      >
                        {(file.fileSize / 1024 / 1024).toFixed(1)} MB
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name="download"
                    size={16}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderReplyTo = () => {
    if (!message.replyTo) return null;

    return (
      <View
        style={{
          backgroundColor: isDarkMode
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
          borderLeftWidth: 3,
          borderLeftColor: "#10B981",
          paddingLeft: 8,
          paddingVertical: 4,
          marginBottom: 8,
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: "#10B981",
            marginBottom: 2,
          }}
        >
          {message.replyTo.sender.firstName} {message.replyTo.sender.lastName}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.textSecondary,
          }}
          numberOfLines={2}
        >
          {message.replyTo.content || "📎 Media"}
        </Text>
      </View>
    );
  };

  const renderMessageStatus = () => {
    if (!isOwn) return null;

    // Check message status based on different states
    const isRead =
      message.readBy &&
      message.readBy.some((read: any) => read.user !== user?._id);
    const isDelivered = message.deliveredTo && message.deliveredTo.length > 0;
    const isSent = message.status === "sent" || message._id; // If message has ID, it's sent
    const isPending = message.status === "pending" || !message._id; // If no ID, it's pending

    let iconName: string;
    let iconColor: string;

    if (isPending) {
      iconName = "time-outline";
      iconColor = colors.textSecondary;
    } else if (isRead) {
      iconName = "checkmark-done";
      iconColor = "#007AFF"; // Blue color for read
    } else if (isDelivered || isSent) {
      iconName =
        message.messageType === "text" ? "checkmark" : "checkmark-done";
      iconColor = colors.textSecondary;
    } else {
      iconName = "checkmark";
      iconColor = colors.textSecondary;
    }

    return (
      <View
        style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}
      >
        <Ionicons name={iconName as any} size={12} color={iconColor} />
      </View>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        marginVertical: 2,
        paddingHorizontal: 16,
        justifyContent: isOwn ? "flex-end" : "flex-start",
      }}
    >
      {/* Avatar for other users */}
      {!isOwn && showAvatar && (
        <View style={{ marginRight: 8, marginBottom: 4 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#10B981",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {message.sender.profilePicture ? (
              <Image
                source={{ uri: message.sender.profilePicture }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={16} color="white" />
            )}
          </View>
        </View>
      )}

      {/* Message Bubble */}
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        style={{
          maxWidth: "75%",
          backgroundColor: isOwn
            ? "#10B981"
            : isDarkMode
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
          borderRadius: 16,
          borderBottomRightRadius: isOwn ? 4 : 16,
          borderBottomLeftRadius: isOwn ? 16 : 4,
          padding: 12,
          elevation: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}
      >
        {/* Sender name for group chats */}
        {!isOwn && showAvatar && (
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: "#10B981",
              marginBottom: 4,
            }}
          >
            {message.sender.firstName} {message.sender.lastName}
          </Text>
        )}

        {/* Reply indicator */}
        {renderReplyTo()}

        {/* Media files */}
        {renderMediaFiles()}

        {/* Message content */}
        {message.content && (
          <Text
            style={{
              fontSize: 16,
              color: isOwn ? "white" : colors.text,
              lineHeight: 20,
            }}
          >
            {message.content}
          </Text>
        )}

        {/* Message time and status */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop:
              message.content || message.mediaFiles?.length > 0 ? 8 : 0,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: isOwn ? "rgba(255, 255, 255, 0.8)" : colors.textSecondary,
              fontWeight: "500",
            }}
          >
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: false,
            })}
            {message.isEdited && " (edited)"}
          </Text>

          {renderMessageStatus()}
        </View>
      </TouchableOpacity>

      {/* Full-screen Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Top overlay with close button */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 100,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              zIndex: 2,
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: 40,
              paddingRight: 20,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 25,
                padding: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Image container */}
          {selectedImage && (
            <TouchableOpacity
              style={{
                flex: 1,
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setImageModalVisible(false)}
              activeOpacity={1}
            >
              <Image
                source={{ uri: selectedImage }}
                style={{
                  width: screenWidth,
                  height: screenHeight * 0.8,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}

          {/* Bottom overlay with download button */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              zIndex: 2,
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingBottom: 40,
              paddingRight: 20,
            }}
          >
            {selectedImage && (
              <TouchableOpacity
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 25,
                  padding: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}
                onPress={async () => {
                  try {
                    const { status } =
                      await MediaLibrary.requestPermissionsAsync();
                    if (status === "granted") {
                      try {
                        await MediaLibrary.saveToLibraryAsync(selectedImage);
                        Alert.alert("Success", "Image saved to gallery!");
                      } catch (error) {
                        // If direct save fails, use sharing
                        const canShare = await Sharing.isAvailableAsync();
                        if (canShare) {
                          await Sharing.shareAsync(selectedImage);
                        } else {
                          Alert.alert("Error", "Failed to save image.");
                        }
                      }
                    } else {
                      // Use sharing if no permission
                      const canShare = await Sharing.isAvailableAsync();
                      if (canShare) {
                        await Sharing.shareAsync(selectedImage);
                      } else {
                        Alert.alert(
                          "Permission Required",
                          "Please grant media library permissions to save images."
                        );
                      }
                    }
                  } catch (error) {
                    Alert.alert("Error", "Failed to save image.");
                  }
                }}
              >
                <Ionicons name="download" size={24} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
