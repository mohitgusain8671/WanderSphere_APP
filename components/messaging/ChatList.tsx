import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSocket } from '../../contexts/SocketContext';
import { useAppStore } from '../../store';

interface ChatListProps {
  chats: any[];
  onChatPress: (chat: any) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onLoadMore?: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  onChatPress,
  onRefresh,
  refreshing = false,
  onLoadMore,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { onlineUsers } = useSocket();
  const { user } = useAppStore();

  const renderChatItem = ({ item: chat }: { item: any }) => {
    const isGroup = chat.isGroupChat;
    const otherParticipant = isGroup ? null : chat.participants?.find((p: any) => p._id !== user?._id);
    const chatName = isGroup ? chat.name : chat.chatName || `${otherParticipant?.firstName} ${otherParticipant?.lastName}`;
    const chatImage = isGroup ? chat.groupImage : otherParticipant?.profilePicture;
    const isOnline = !isGroup && otherParticipant && onlineUsers.has(otherParticipant._id);
    const hasUnread = chat.unreadCount > 0;

    return (
      <TouchableOpacity
        onPress={() => onChatPress(chat)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: hasUnread 
            ? isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'
            : 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Chat Avatar */}
        <View style={{ position: 'relative', marginRight: 12 }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#10B981',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            {chatImage ? (
              <Image
                source={{ uri: chatImage }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons
                name={isGroup ? 'people' : 'person'}
                size={24}
                color="white"
              />
            )}
          </View>
          
          {/* Online indicator for individual chats */}
          {!isGroup && isOnline && (
            <View
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: '#10B981',
                borderWidth: 2,
                borderColor: colors.background,
              }}
            />
          )}
          
          {/* Group indicator */}
          {isGroup && (
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                backgroundColor: '#3B82F6',
                borderRadius: 8,
                paddingHorizontal: 4,
                paddingVertical: 2,
              }}
            >
              <Ionicons name="people" size={10} color="white" />
            </View>
          )}
        </View>

        {/* Chat Info */}
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: hasUnread ? '700' : '600',
                color: colors.text,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {chatName}
            </Text>
            
            {chat.lastMessage && (
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  fontWeight: hasUnread ? '600' : '400',
                }}
              >
                {formatDistanceToNow(new Date(chat.lastActivity), { addSuffix: true })}
              </Text>
            )}
          </View>

          {/* Last Message */}
          {chat.lastMessage && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 14,
                  color: hasUnread ? colors.text : colors.textSecondary,
                  fontWeight: hasUnread ? '600' : '400',
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {chat.lastMessage.messageType === 'text' 
                  ? chat.lastMessage.content 
                  : `📎 ${chat.lastMessage.messageType}`}
              </Text>
              
              {/* Unread count */}
              {hasUnread && (
                <View
                  style={{
                    backgroundColor: '#10B981',
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 6,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 12,
                      fontWeight: '700',
                    }}
                  >
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      paddingVertical: 60,
      paddingHorizontal: 20,
    }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Ionicons name="chatbubbles-outline" size={40} color="#10B981" />
      </View>
      
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        No Messages Yet
      </Text>
      
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        Start a conversation with your travel buddies{'\n'}and share your adventures!
      </Text>
    </View>
  );

  return (
    <FlatList
      data={chats}
      renderItem={renderChatItem}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={chats.length === 0 ? { flex: 1 } : undefined}
    />
  );
};