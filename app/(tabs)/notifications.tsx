import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { formatDistanceToNow } from 'date-fns';
import { COLORS } from '../../utils/constants';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { 
    notifications, 
    unreadCount,
    hasMore: hasMoreNotifications,
    isNotificationLoading,
    getNotifications,
    loadMoreNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications
  } = useAppStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    // Load notifications on mount
    getNotifications(1, showUnreadOnly);
  }, [showUnreadOnly]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await getNotifications(1, showUnreadOnly);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (hasMoreNotifications && !isNotificationLoading) {
      await loadMoreNotifications(showUnreadOnly);
    }
  };

  const handleNotificationPress = async (notification: any) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'friend_request':
      case 'friend_accepted':
        // TODO: Navigate to friends screen
        console.log('Navigate to friends screen');
        break;
      case 'post_like':
      case 'post_comment':
      case 'tagged_in_post':
        // TODO: Navigate to post
        console.log('Navigate to post:', notification.data.postId);
        break;
      case 'story_like':
        // TODO: Navigate to story
        console.log('Navigate to story:', notification.data.storyId);
        break;
      default:
        break;
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteNotification(notificationId)
        }
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllNotificationsAsRead();
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => clearAllNotifications()
        }
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return 'person-add';
      case 'friend_accepted':
        return 'people';
      case 'post_like':
        return 'heart';
      case 'post_comment':
        return 'chatbubble';
      case 'story_like':
        return 'heart-circle';
      case 'tagged_in_post':
        return 'pricetag';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return '#3B82F6';
      case 'post_like':
      case 'story_like':
        return '#EF4444';
      case 'post_comment':
        return '#10B981';
      case 'tagged_in_post':
        return '#F59E0B';
      default:
        return colors.textSecondary;
    }
  };

  const renderNotification = ({ item: notification }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(notification)}
      className={`flex-row items-start p-4 mb-2 rounded-xl ${
        !notification.isRead ? 'border-l-4' : ''
      }`}
      style={{ 
        backgroundColor: colors.surface,
        borderLeftColor: !notification.isRead ? COLORS.primary : 'transparent'
      }}
    >
      {/* Sender Avatar */}
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: colors.background }}
      >
        {notification.sender?.profilePicture ? (
          <Image
            source={{ uri: notification.sender.profilePicture }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <Ionicons 
            name={getNotificationIcon(notification.type)} 
            size={24} 
            color={getNotificationColor(notification.type)} 
          />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text 
          className={`text-base leading-5 ${!notification.isRead ? 'font-semibold' : 'font-normal'}`}
          style={{ color: colors.text }}
        >
          {notification.message}
        </Text>
        <Text 
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row items-center">
        {!notification.isRead && (
          <View 
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: COLORS.primary }}
          />
        )}
        <TouchableOpacity
          onPress={() => handleDeleteNotification(notification._id)}
          className="p-1"
        >
          <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="px-4 pt-2 pb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text 
          className="text-2xl font-bold"
          style={{ color: colors.text }}
        >
          Notifications
        </Text>
        {unreadCount > 0 && (
          <View 
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-white text-xs font-semibold">
              {unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-2 mb-4">
        <TouchableOpacity
          onPress={() => setShowUnreadOnly(!showUnreadOnly)}
          className={`flex-1 py-2 px-4 rounded-lg`}
          style={{ 
            backgroundColor: showUnreadOnly ? COLORS.primary : colors.surface 
          }}
        >
          <Text 
            className="text-center font-semibold"
            style={{ 
              color: showUnreadOnly ? 'white' : colors.text 
            }}
          >
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMarkAllAsRead}
          className="px-4 py-2 rounded-lg"
          style={{ backgroundColor: colors.surface }}
          disabled={unreadCount === 0}
        >
          <Text 
            className="font-semibold"
            style={{ 
              color: unreadCount > 0 ? colors.text : colors.textSecondary 
            }}
          >
            Mark All Read
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleClearAll}
          className="px-4 py-2 rounded-lg"
          style={{ backgroundColor: colors.surface }}
        >
          <Text 
            className="font-semibold"
            style={{ color: '#EF4444' }}
          >
            Clear All
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View 
        className="w-20 h-20 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: colors.surface }}
      >
        <Ionicons name="notifications-outline" size={32} color={colors.textSecondary} />
      </View>
      <Text 
        className="text-lg font-semibold mb-2"
        style={{ color: colors.text }}
      >
        No notifications
      </Text>
      <Text 
        className="text-center text-base px-8"
        style={{ color: colors.textSecondary }}
      >
        {showUnreadOnly 
          ? "You don't have any unread notifications."
          : "You're all caught up! New notifications will appear here."
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {renderHeader()}

      <View className="flex-1 px-4">
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}