import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatList } from "../../components/messaging/ChatList";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppStore } from "../../store/index";
import { useFocusEffect } from "@react-navigation/native";

export default function MessagesScreen() {
  const { colors, isDarkMode } = useTheme();
  const {
    chats,
    chatFilter,
    searchQuery,
    isChatsLoading,
    getUserChats,
    setChatFilter,
    setSearchQuery,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Load chats when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [chatFilter])
  );

  const loadChats = async () => {
    await getUserChats(1, chatFilter);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const handleChatPress = (chat: any) => {
    router.push({
      pathname: "/(tabs)/chat/[chatId]" as any,
      params: { chatId: chat._id, chatName: chat.chatName || chat.name },
    });
  };

  const handleNewChat = () => {
    router.push("/(tabs)/new-chat" as any);
  };

  const handleFilterChange = async (filter: string) => {
    if (filter === chatFilter) return; // Don't reload if same filter
    
    setIsFilterLoading(true);
    setChatFilter(filter);
    
    // Load chats with new filter
    await getUserChats(1, filter);
    setIsFilterLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Debounce search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      // Implement search logic here if needed
      console.log("Searching for:", query);
    }, 500);

    setSearchTimeout(timeout);
  };

  const filteredChats = chats.filter((chat: any) => {
    if (!searchQuery) return true;

    const chatName = chat.isGroupChat ? chat.name : chat.chatName;
    return chatName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filterOptions = [
    { key: "all", label: "All", icon: "chatbubbles" },
    { key: "groups", label: "Groups", icon: "people" },
    { key: "friends", label: "Friends", icon: "person" },
    { key: "unread", label: "Unread", icon: "mail-unread" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: isDarkMode
            ? "rgba(15, 23, 42, 0.96)"
            : "rgba(255, 255, 255, 0.98)",
          borderBottomWidth: 1.5,
          borderBottomColor: isDarkMode
            ? "rgba(16, 185, 129, 0.2)"
            : "rgba(16, 185, 129, 0.15)",
          paddingTop: 16,
          paddingBottom: 20,
          paddingHorizontal: 20,
          elevation: 4,
          shadowColor: isDarkMode ? "#10B981" : "#059669",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 6,
                  height: 28,
                  backgroundColor: "#10B981",
                  borderRadius: 3,
                  marginRight: 12,
                }}
              />
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: colors.text,
                  letterSpacing: -0.5,
                }}
              >
                💬 Messages
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleNewChat}>
            <View
              style={{
                backgroundColor: "#10B981",
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="add" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: isDarkMode
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(16, 185, 129, 0.1)",
          }}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 16,
              color: colors.text,
            }}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleFilterChange(option.key)}
              disabled={isFilterLoading}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor:
                  chatFilter === option.key
                    ? "#10B981"
                    : isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 12,
                borderWidth: 1,
                borderColor:
                  chatFilter === option.key
                    ? "#10B981"
                    : isDarkMode
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
                opacity: isFilterLoading ? 0.7 : 1,
              }}
            >
              {isFilterLoading && chatFilter === option.key ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name={option.icon as any}
                  size={16}
                  color={chatFilter === option.key ? "white" : colors.text}
                />
              )}
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 14,
                  fontWeight: "600",
                  color: chatFilter === option.key ? "white" : colors.text,
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat List */}
      {(isChatsLoading || isFilterLoading) && chats.length === 0 ? (
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
            {isFilterLoading ? "Filtering conversations..." : "Loading conversations..."}
          </Text>
        </View>
      ) : isFilterLoading ? (
        <View
          style={{ 
            flex: 1, 
            justifyContent: "center", 
            alignItems: "center",
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <ActivityIndicator size="large" color="#10B981" />
            <Text
              style={{
                marginTop: 16,
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              Updating filter...
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              Please wait while we load your {chatFilter} conversations
            </Text>
          </View>
        </View>
      ) : (
        <ChatList
          chats={filteredChats}
          onChatPress={handleChatPress}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </SafeAreaView>
  );
}
