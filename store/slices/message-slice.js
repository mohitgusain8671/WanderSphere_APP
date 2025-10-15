import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { MESSAGE_ROUTES, STORAGE_KEYS } from "../../utils/constants";

export const createMessageSlice = (set, get) => ({
  // Message State
  chats: [],
  currentChat: null,
  messages: {}, // chatId -> messages array
  isChatsLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  chatFilter: "all", // all, groups, friends, unread
  searchQuery: "",
  typingUsers: new Map(), // chatId -> userIds array

  // Chat Actions
  setChats: (chats) => set({ chats }),
  setCurrentChat: (chat) => set({ currentChat: chat }),
  setChatFilter: (filter) => set({ chatFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Get user chats
  getUserChats: async (page = 1, filter = "all") => {
    set({ isChatsLoading: true });
    try {
      const accessToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN
      );
      const response = await axios.get(MESSAGE_ROUTES.GET_CHATS, {
        params: { page, limit: 20, filter },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      if (data.success) {
        if (page === 1) {
          set({ chats: data.data.chats });
        } else {
          const currentChats = get().chats;
          set({ chats: [...currentChats, ...data.data.chats] });
        }
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to get chats";
      return { success: false, error: errorMessage };
    } finally {
      set({ isChatsLoading: false });
    }
  },

  // Create new chat
  createChat: async (participantId) => {
    try {
      const accessToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN
      );
      const response = await axios.post(
        MESSAGE_ROUTES.CREATE_CHAT,
        { participantId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;
      if (data.success) {
        // Add new chat to the beginning of chats list
        const currentChats = get().chats;
        const chatExists = currentChats.find(
          (chat) => chat._id === data.data.chat._id
        );
        if (!chatExists) {
          set({ chats: [data.data.chat, ...currentChats] });
        }
        return { success: true, data: data.data.chat };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create chat";
      return { success: false, error: errorMessage };
    }
  },

  // Create group chat
  createGroupChat: async (name, participantIds) => {
    try {
      const accessToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN
      );
      const response = await axios.post(
        MESSAGE_ROUTES.CREATE_GROUP,
        { name, participantIds },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;
      if (data.success) {
        // Add new group chat to the beginning of chats list
        const currentChats = get().chats;
        set({ chats: [data.data.chat, ...currentChats] });
        return { success: true, data: data.data.chat };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create group chat";
      return { success: false, error: errorMessage };
    }
  },

  // Search users for chat
  searchUsersForChat: async (query) => {
    try {
      const accessToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN
      );
      const response = await axios.get(MESSAGE_ROUTES.SEARCH_USERS, {
        params: { query },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data.users };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to search users";
      return { success: false, error: errorMessage };
    }
  },

  // Message Actions
  getChatMessages: async (chatId, page = 1) => {
    set({ isMessagesLoading: true });
    try {
      const accessToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN
      );
      const response = await axios.get(MESSAGE_ROUTES.GET_MESSAGES(chatId), {
        params: { page, limit: 100 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      if (data.success) {
        const currentMessages = get().messages;
        const chatMessages = currentMessages[chatId] || [];

        if (page === 1) {
          set({
            messages: {
              ...currentMessages,
              [chatId]: data.data.messages,
            },
          });
        } else {
          // Prepend older messages for infinite scroll
          const newMessages = [...data.data.messages, ...chatMessages];
          set({
            messages: {
              ...currentMessages,
              [chatId]: newMessages,
            },
          });
        }

        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to get messages";
      return { success: false, error: errorMessage };
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send message via API (for media files)
  sendMessageAPI: async (chatId, messageData, mediaFiles = null) => {
    set({ isSendingMessage: true });
    try {
      const accessToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN
      );

      const formData = new FormData();
      formData.append("content", messageData.content || "");
      formData.append("messageType", messageData.messageType || "text");
      if (messageData.replyToId) {
        formData.append("replyToId", messageData.replyToId);
      }

      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file, index) => {
          formData.append("mediaFiles", {
            uri: file.uri,
            type: file.type,
            name: file.name || `file_${index}`,
          });
        });
      }

      const response = await axios.post(
        MESSAGE_ROUTES.SEND_MESSAGE(chatId),
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;
      if (data.success) {
        return { success: true, data: data.data.message };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send message";
      return { success: false, error: errorMessage };
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (chatId, messageIds) => {
    try {
      const accessToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN
      );
      const response = await axios.put(
        MESSAGE_ROUTES.MARK_READ(chatId),
        { messageIds },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;
      return { success: data.success, message: data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark messages as read";
      return { success: false, error: errorMessage };
    }
  },

  // Socket-based actions (called from SocketContext)
  addMessage: (chatId, message) => {
    const currentMessages = get().messages;
    const chatMessages = currentMessages[chatId] || [];

    // Check if message already exists to prevent duplicates
    const messageExists = chatMessages.some(dateGroup => 
      dateGroup.messages.some(msg => msg._id === message._id)
    );
    
    if (messageExists) {
      return; // Don't add duplicate message
    }

    // Find the correct date group or create new one
    const messageDate = new Date(message.createdAt).toDateString();
    let updatedMessages = [...chatMessages];

    // Check if we need to add to existing date group or create new one
    const lastGroup = updatedMessages[updatedMessages.length - 1];
    if (lastGroup && lastGroup.date === messageDate) {
      // Add to existing date group
      lastGroup.messages.push(message);
    } else {
      // Create new date group
      updatedMessages.push({
        date: messageDate,
        messages: [message],
      });
    }

    set({
      messages: {
        ...currentMessages,
        [chatId]: updatedMessages,
      },
    });
  },

  updateChatLastMessage: (chatId, lastMessage, lastActivity) => {
    const currentChats = get().chats;
    const updatedChats = currentChats.map((chat) => {
      if (chat._id === chatId) {
        return {
          ...chat,
          lastMessage,
          lastActivity,
        };
      }
      return chat;
    });

    // Sort chats by last activity
    updatedChats.sort(
      (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
    );
    set({ chats: updatedChats });
  },

  markMessageAsRead: (messageId, readBy, readAt) => {
    const currentMessages = get().messages;
    const updatedMessages = { ...currentMessages };

    // Update message in all chats
    Object.keys(updatedMessages).forEach((chatId) => {
      updatedMessages[chatId] = updatedMessages[chatId].map((dateGroup) => ({
        ...dateGroup,
        messages: dateGroup.messages.map((message) => {
          if (message._id === messageId) {
            const existingRead = message.readBy?.find(
              (read) => read.user === readBy
            );
            if (!existingRead) {
              return {
                ...message,
                readBy: [...(message.readBy || []), { user: readBy, readAt }],
              };
            }
          }
          return message;
        }),
      }));
    });

    set({ messages: updatedMessages });
  },

  markMessageAsDelivered: (messageId, deliveredTo, deliveredAt) => {
    const currentMessages = get().messages;
    const updatedMessages = { ...currentMessages };

    // Update message in all chats
    Object.keys(updatedMessages).forEach((chatId) => {
      updatedMessages[chatId] = updatedMessages[chatId].map((dateGroup) => ({
        ...dateGroup,
        messages: dateGroup.messages.map((message) => {
          if (message._id === messageId) {
            const existingDelivered = message.deliveredTo?.find(
              (delivered) => delivered.user === deliveredTo
            );
            if (!existingDelivered) {
              return {
                ...message,
                deliveredTo: [
                  ...(message.deliveredTo || []),
                  { user: deliveredTo, deliveredAt },
                ],
              };
            }
          }
          return message;
        }),
      }));
    });

    set({ messages: updatedMessages });
  },

  // Clear messages for a chat
  clearChatMessages: (chatId) => {
    const currentMessages = get().messages;
    const updatedMessages = { ...currentMessages };
    delete updatedMessages[chatId];
    set({ messages: updatedMessages });
  },

  // Update typing users
  setTypingUsers: (chatId, userIds) => {
    const currentTyping = get().typingUsers;
    const newTyping = new Map(currentTyping);
    if (userIds.length === 0) {
      newTyping.delete(chatId);
    } else {
      newTyping.set(chatId, userIds);
    }
    set({ typingUsers: newTyping });
  },
});
