import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { MessageBubble } from "../../../components/messaging/MessageBubble";
import { useTheme } from "../../../contexts/ThemeContext";
import { useSocket } from "../../../contexts/SocketContext";
import { useAppStore } from "../../../store";
import { useToast } from "../../../contexts/ToastContext";
import { useFocusEffect } from "@react-navigation/native";

export default function ChatScreen() {
  const { chatId, chatName } = useLocalSearchParams();
  const { colors, isDarkMode } = useTheme();
  const { socket, typingUsers } = useSocket();
  const { showSuccess, showError } = useToast();
  const {
    messages,
    isMessagesLoading,
    getChatMessages,
    sendMessageAPI,
    markMessagesAsRead,
    user,
  } = useAppStore();

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      progress: number;
      status: "uploading" | "completed" | "failed";
    }>
  >([]);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadCancelTokens = useRef<Map<string, () => void>>(new Map());

  const chatMessages = messages[chatId as string] || [];
  const chatTypingUsers = (typingUsers.get(chatId as string) || []).filter(
    (userId: string) => userId !== user?._id
  );

  // Load messages when screen focuses
  useFocusEffect(
    useCallback(() => {
      if (chatId) {
        loadMessages();
        joinChat();
      }

      return () => {
        leaveChat();
      };
    }, [chatId])
  );

  const loadMessages = async () => {
    const result = await getChatMessages(chatId as string, 1);
    if (result.success) {
      setHasMore(result.data.pagination.hasMore);
      setPage(1);

      // Mark messages as read
      const unreadMessages = chatMessages
        .flatMap((group: any) => group.messages)
        .filter(
          (msg: any) =>
            msg.sender._id !== user?._id &&
            !msg.readBy?.some((read: any) => read.user === user?._id)
        )
        .map((msg: any) => msg._id);

      if (unreadMessages.length > 0) {
        markMessagesAsRead(chatId as string, unreadMessages);

        // Emit read receipts via socket
        unreadMessages.forEach((messageId: any) => {
          socket?.emit("message_read", { messageId, chatId });
        });
      }
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || isMessagesLoading) return;

    const nextPage = page + 1;
    const result = await getChatMessages(chatId as string, nextPage);
    if (result.success) {
      setHasMore(result.data.pagination.hasMore);
      setPage(nextPage);
    }
  };

  const joinChat = () => {
    if (socket && chatId) {
      socket.emit("join_chat", chatId);
    }
  };

  const leaveChat = () => {
    if (socket && chatId) {
      socket.emit("leave_chat", chatId);
      stopTyping();
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);

    const messageData = {
      content: messageText.trim(),
      messageType: "text",
      replyToId: replyTo?._id,
    };

    // Clear input immediately to prevent multiple sends
    const messageToSend = messageText.trim();
    setMessageText("");
    setReplyTo(null);
    stopTyping();

    // Send via socket for real-time delivery
    if (socket) {
      socket.emit("send_message", {
        chatId,
        content: messageToSend,
        messageType: "text",
        replyToId: messageData.replyToId,
      });
    }

    // Reset sending state after a short delay
    setTimeout(() => {
      setIsSending(false);
    }, 1000);
  };

  const sendMediaMessage = async (mediaFiles: any[]) => {
    const uploadId = `upload_${Date.now()}`;
    const fileName = mediaFiles[0].name || "Unknown file";
    const fileType = mediaFiles[0].type;

    // Add to uploading files list
    const uploadingFile = {
      id: uploadId,
      name: fileName,
      type: fileType,
      progress: 0,
      status: "uploading" as const,
    };

    setUploadingFiles((prev) => [...prev, uploadingFile]);

    try {
      // Simulate progress updates (since we don't have real progress from the API)
      const progressInterval = setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((file) =>
            file.id === uploadId && file.progress < 90
              ? { ...file, progress: file.progress + 10 }
              : file
          )
        );
      }, 200);

      // Store cancel function
      uploadCancelTokens.current.set(uploadId, () => {
        clearInterval(progressInterval);
        setUploadingFiles((prev) =>
          prev.filter((file) => file.id !== uploadId)
        );
      });

      const result = await sendMessageAPI(
        chatId as string,
        {
          content: "",
          messageType: mediaFiles[0].type.startsWith("image")
            ? "image"
            : "document",
        },
        mediaFiles
      );

      clearInterval(progressInterval);
      uploadCancelTokens.current.delete(uploadId);

      if (result.success) {
        // Mark as completed
        setUploadingFiles((prev) =>
          prev.map((file) =>
            file.id === uploadId
              ? { ...file, progress: 100, status: "completed" }
              : file
          )
        );

        // Refresh messages to show the newly sent media immediately
        await loadMessages();

        // Scroll to bottom to show the new message
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);

        // Show success toast and remove from list after a short delay
        showSuccess("File sent successfully!");
        setTimeout(() => {
          setUploadingFiles((prev) =>
            prev.filter((file) => file.id !== uploadId)
          );
        }, 1500);
      } else {
        // Mark as failed
        setUploadingFiles((prev) =>
          prev.map((file) =>
            file.id === uploadId ? { ...file, status: "failed" } : file
          )
        );
        showError(result.error || "Upload failed");
      }
    } catch (error) {
      uploadCancelTokens.current.delete(uploadId);
      setUploadingFiles((prev) =>
        prev.map((file) =>
          file.id === uploadId ? { ...file, status: "failed" } : file
        )
      );
      showError("Failed to send media file");
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);

    if (!isTyping && text.trim()) {
      setIsTyping(true);
      socket?.emit("typing", { chatId });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socket?.emit("stop_typing", { chatId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const cancelUpload = (uploadId: string) => {
    const cancelFn = uploadCancelTokens.current.get(uploadId);
    if (cancelFn) {
      cancelFn();
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        // Validate file sizes (max 10MB per file)
        const validAssets = result.assets.filter((asset) => {
          const fileSizeMB = (asset.fileSize || 0) / (1024 * 1024);
          if (fileSizeMB > 10) {
            Alert.alert(
              "File Too Large",
              `${asset.fileName || "File"} is too large. Maximum size is 10MB.`
            );
            return false;
          }
          return true;
        });

        if (validAssets.length === 0) return;

        const mediaFiles = validAssets.map((asset, index) => ({
          uri: asset.uri,
          type: asset.type === "video" ? "video/mp4" : "image/jpeg",
          name:
            asset.fileName ||
            `media_${Date.now()}_${index}.${
              asset.type === "video" ? "mp4" : "jpg"
            }`,
        }));

        sendMediaMessage(mediaFiles);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick media files");
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        // Validate file sizes (max 25MB per file for documents)
        const validAssets = result.assets.filter((asset) => {
          const fileSizeMB = (asset.size || 0) / (1024 * 1024);
          if (fileSizeMB > 25) {
            Alert.alert(
              "File Too Large",
              `${asset.name} is too large. Maximum size is 25MB.`
            );
            return false;
          }
          return true;
        });

        if (validAssets.length === 0) return;

        const mediaFiles = validAssets.map((asset) => ({
          uri: asset.uri,
          type: asset.mimeType || "application/octet-stream",
          name: asset.name,
        }));

        sendMediaMessage(mediaFiles);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const renderDateSeparator = (date: string) => (
    <View
      style={{
        alignItems: "center",
        marginVertical: 16,
      }}
    >
      <View
        style={{
          backgroundColor: isDarkMode
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: "600",
          }}
        >
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
    </View>
  );

  const renderMessageGroup = ({ item: dateGroup }: { item: any }) => (
    <View>
      {renderDateSeparator(dateGroup.date)}
      {dateGroup.messages.map((message: any, index: number) => {
        const isOwn = message.sender._id === user?._id;
        const showAvatar =
          !isOwn &&
          (index === dateGroup.messages.length - 1 ||
            dateGroup.messages[index + 1]?.sender._id !== message.sender._id);

        return (
          <MessageBubble
            key={`${message._id}-${index}`}
            message={message}
            isOwn={isOwn}
            showAvatar={showAvatar}
            onLongPress={() => {
              // Handle message actions (reply, delete, etc.)
              if (isOwn) {
                Alert.alert("Message Options", "What would you like to do?", [
                  { text: "Reply", onPress: () => setReplyTo(message) },
                  { text: "Delete", style: "destructive" },
                  { text: "Cancel", style: "cancel" },
                ]);
              } else {
                setReplyTo(message);
              }
            }}
          />
        );
      })}
    </View>
  );

  const renderTypingIndicator = () => {
    if (chatTypingUsers.length === 0) return null;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <View
          style={{
            backgroundColor: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginRight: 8,
            }}
          >
            {chatTypingUsers.length === 1
              ? "Someone is"
              : `${chatTypingUsers.length} people are`}{" "}
            typing
          </Text>
          <View style={{ flexDirection: "row" }}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.textSecondary,
                  marginHorizontal: 1,
                  opacity: 0.6,
                }}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderUploadProgress = () => {
    if (uploadingFiles.length === 0) return null;

    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        {uploadingFiles.map((file) => (
          <View
            key={file.id}
            style={{
              backgroundColor: isDarkMode
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
              borderRadius: 12,
              padding: 12,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: isDarkMode
                ? "rgba(16, 185, 129, 0.2)"
                : "rgba(16, 185, 129, 0.1)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons
                name={
                  file.type.startsWith("image")
                    ? "image"
                    : file.type.startsWith("video")
                    ? "videocam"
                    : "document"
                }
                size={20}
                color={
                  file.status === "failed"
                    ? "#EF4444"
                    : file.status === "completed"
                    ? "#10B981"
                    : "#3B82F6"
                }
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginLeft: 8,
                }}
                numberOfLines={1}
              >
                {file.name}
              </Text>

              {file.status === "uploading" && (
                <TouchableOpacity
                  onPress={() => cancelUpload(file.id)}
                  style={{
                    backgroundColor: "#EF4444",
                    borderRadius: 12,
                    padding: 4,
                  }}
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              )}

              {file.status === "completed" && (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              )}

              {file.status === "failed" && (
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
              )}
            </View>

            {file.status === "uploading" && (
              <View>
                <View
                  style={{
                    height: 4,
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${file.progress}%`,
                      backgroundColor: "#10B981",
                      borderRadius: 2,
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 4,
                    textAlign: "center",
                  }}
                >
                  Uploading... {file.progress}%
                </Text>
              </View>
            )}

            {file.status === "completed" && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#10B981",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                ✓ Sent successfully
              </Text>
            )}

            {file.status === "failed" && (
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#EF4444",
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  ✗ Upload failed
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    // Remove failed upload from list
                    setUploadingFiles((prev) =>
                      prev.filter((f) => f.id !== file.id)
                    );
                  }}
                  style={{
                    backgroundColor: "#EF4444",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 10, fontWeight: "600" }}
                  >
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: isDarkMode
            ? "rgba(15, 23, 42, 0.96)"
            : "rgba(255, 255, 255, 0.98)",
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.text,
              }}
              numberOfLines={1}
            >
              {chatName || "Chat"}
            </Text>
            {uploadingFiles.length > 0 ? (
              <Text
                style={{
                  fontSize: 12,
                  color: "#3B82F6",
                  fontWeight: "500",
                }}
              >
                Uploading {uploadingFiles.length} file
                {uploadingFiles.length !== 1 ? "s" : ""}...
              </Text>
            ) : chatTypingUsers.length > 0 ? (
              <Text
                style={{
                  fontSize: 12,
                  color: "#10B981",
                  fontWeight: "500",
                }}
              >
                typing...
              </Text>
            ) : null}
          </View>

          <TouchableOpacity>
            <Ionicons name="call-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={{ marginLeft: 16 }}>
            <Ionicons name="videocam-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reply Banner */}
      {replyTo && (
        <View
          style={{
            backgroundColor: isDarkMode
              ? "rgba(16, 185, 129, 0.1)"
              : "rgba(16, 185, 129, 0.05)",
            borderBottomWidth: 1,
            borderBottomColor: "#10B981",
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#10B981",
                marginBottom: 2,
              }}
            >
              Replying to {replyTo.sender.firstName}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.text,
              }}
              numberOfLines={1}
            >
              {replyTo.content || "📎 Media"}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {isMessagesLoading && chatMessages.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#10B981" />
            <Text
              style={{
                marginTop: 16,
                fontSize: 16,
                color: colors.textSecondary,
              }}
            >
              Loading messages...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={renderMessageGroup}
            keyExtractor={(item) => item.date}
            showsVerticalScrollIndicator={false}
            inverted
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            ListHeaderComponent={() => (
              <View>
                {renderTypingIndicator()}
                {renderUploadProgress()}
              </View>
            )}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )}

        {/* Message Input */}
        <View
          style={{
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: 58, // Add padding to avoid bottom tab bar
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            {/* Media Buttons */}
            <TouchableOpacity
              onPress={handleImagePicker}
              disabled={uploadingFiles.length > 0}
              style={{
                backgroundColor:
                  uploadingFiles.length > 0
                    ? colors.textSecondary
                    : colors.surface,
                borderRadius: 20,
                padding: 8,
                marginRight: 8,
                opacity: uploadingFiles.length > 0 ? 0.6 : 1,
              }}
            >
              {uploadingFiles.some(
                (f) => f.type.startsWith("image") && f.status === "uploading"
              ) ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <Ionicons name="camera" size={20} color="#10B981" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDocumentPicker}
              disabled={uploadingFiles.length > 0}
              style={{
                backgroundColor:
                  uploadingFiles.length > 0
                    ? colors.textSecondary
                    : colors.surface,
                borderRadius: 20,
                padding: 8,
                marginRight: 8,
                opacity: uploadingFiles.length > 0 ? 0.6 : 1,
              }}
            >
              {uploadingFiles.some(
                (f) => !f.type.startsWith("image") && f.status === "uploading"
              ) ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <Ionicons name="attach" size={20} color="#10B981" />
              )}
            </TouchableOpacity>

            {/* Text Input */}
            <View
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
                maxHeight: 100,
              }}
            >
              <TextInput
                style={{
                  fontSize: 16,
                  color: colors.text,
                  minHeight: 20,
                }}
                placeholder="Type a message..."
                placeholderTextColor={colors.textSecondary}
                value={messageText}
                onChangeText={handleTyping}
                multiline
                textAlignVertical="center"
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!messageText.trim() || isSending}
              style={{
                backgroundColor:
                  messageText.trim() && !isSending ? "#10B981" : colors.surface,
                borderRadius: 20,
                padding: 8,
              }}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={
                    messageText.trim() && !isSending
                      ? "white"
                      : colors.textSecondary
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
