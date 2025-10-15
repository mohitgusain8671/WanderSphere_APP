import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppStore } from "../../store/index";

export default function NewChatScreen() {
  const { colors, isDarkMode } = useTheme();
  const {
    friends,
    searchUsersForChat,
    createChat,
    createGroupChat,
    getFriends,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "friends" | "search" | "group"
  >("friends");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    getFriends();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      const result = await searchUsersForChat(query);
      if (result.success) {
        setSearchResults(result.data);
      }
      setIsSearching(false);
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleCreateChat = async (userId: string) => {
    setIsCreatingChat(true);
    const result = await createChat(userId);
    setIsCreatingChat(false);

    if (result.success) {
      router.replace({
        pathname: "/(tabs)/chat/[chatId]" as any,
        params: { chatId: result.data._id },
      });
    } else {
      Alert.alert("Error", result.error);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selectedFriends.length < 2) {
      Alert.alert("Error", "Please select at least 2 friends for the group");
      return;
    }

    setIsCreatingChat(true);
    const result = await createGroupChat(groupName.trim(), selectedFriends);
    setIsCreatingChat(false);

    if (result.success) {
      router.replace({
        pathname: "/(tabs)/chat/[chatId]" as any,
        params: { chatId: result.data._id },
      });
    } else {
      Alert.alert("Error", result.error);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const renderUserItem = ({ item: user }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        selectedTab === "group"
          ? toggleFriendSelection(user._id)
          : handleCreateChat(user._id)
      }
      disabled={isCreatingChat}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor:
          selectedTab === "group" && selectedFriends.includes(user._id)
            ? isDarkMode
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(16, 185, 129, 0.1)"
            : "transparent",
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
      }}
    >
      <View style={{ position: "relative", marginRight: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#10B981",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {user.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={24} color="white" />
          )}
        </View>

        {selectedTab === "group" && selectedFriends.includes(user._id) && (
          <View
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              backgroundColor: "#10B981",
              borderRadius: 10,
              width: 20,
              height: 20,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: colors.background,
            }}
          >
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 2,
          }}
        >
          {user.firstName} {user.lastName}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
          }}
        >
          {user.email}
        </Text>
      </View>

      {selectedTab !== "group" && (
        <Ionicons name="chatbubble-outline" size={20} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: isDarkMode
            ? "rgba(16, 185, 129, 0.1)"
            : "rgba(16, 185, 129, 0.05)",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Ionicons
          name={selectedTab === "friends" ? "people-outline" : "search-outline"}
          size={40}
          color="#10B981"
        />
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {selectedTab === "friends"
          ? "No Friends Yet"
          : selectedTab === "group"
          ? "No Friends to Add"
          : "No Results Found"}
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        {selectedTab === "friends"
          ? "Add some travel buddies to start chatting!"
          : selectedTab === "group"
          ? "Add friends to create a group chat!"
          : "Try searching with a different name or email"}
      </Text>
    </View>
  );

  const tabs = [
    { key: "friends", label: "Friends", icon: "people" },
    { key: "search", label: "Search", icon: "search" },
    { key: "group", label: "Group", icon: "people-circle" },
  ];

  const currentData =
    selectedTab === "friends"
      ? friends
      : selectedTab === "group"
      ? friends
      : searchResults;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background, paddingBottom: 50 }}
    >
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

          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
            }}
          >
            New Chat
          </Text>

          {selectedTab === "group" && selectedFriends.length >= 2 && (
            <TouchableOpacity
              onPress={handleCreateGroupChat}
              disabled={isCreatingChat}
              style={{
                backgroundColor: "#10B981",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              {isCreatingChat ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Create
                </Text>
              )}
            </TouchableOpacity>
          )}

          {selectedTab !== "group" && <View style={{ width: 24 }} />}
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSelectedTab(tab.key as any)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  selectedTab === tab.key
                    ? "#10B981"
                    : isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                borderRadius: 12,
                paddingVertical: 10,
                marginHorizontal: 4,
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={selectedTab === tab.key ? "white" : colors.text}
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 14,
                  fontWeight: "600",
                  color: selectedTab === tab.key ? "white" : colors.text,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Group Name Input */}
        {selectedTab === "group" && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Group Name
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: isDarkMode
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(16, 185, 129, 0.1)",
              }}
              placeholder="Enter group name..."
              placeholderTextColor={colors.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
            />
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              Select friends below to add to your group
            </Text>
          </View>
        )}

        {/* Search Input */}
        {selectedTab === "search" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
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
              placeholder="Search by name or email..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {isSearching && <ActivityIndicator size="small" color="#10B981" />}
          </View>
        )}

        {/* Selected Friends Count */}
        {selectedTab === "group" && selectedFriends.length > 0 && (
          <Text
            style={{
              fontSize: 14,
              color: "#10B981",
              fontWeight: "600",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            {selectedFriends.length} friend
            {selectedFriends.length !== 1 ? "s" : ""} selected
          </Text>
        )}
      </View>

      {/* User List */}
      {isSearching && selectedTab === "search" ? (
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
            Searching users...
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderUserItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={
            currentData.length === 0 ? { flex: 1 } : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}
