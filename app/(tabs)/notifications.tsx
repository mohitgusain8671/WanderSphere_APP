import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { COLORS } from '../../utils/constants';

export default function NotificationsScreen() {
  const { colors, isDarkMode } = useTheme();
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
      style={{ 
        backgroundColor: !notification.isRead 
          ? (isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)')
          : colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: !notification.isRead ? 1 : 0,
        borderColor: !notification.isRead ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
        elevation: !notification.isRead ? 2 : 1,
        shadowColor: !notification.isRead ? '#10B981' : '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: !notification.isRead ? 0.1 : 0.05,
        shadowRadius: 4,
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
    <View style={{ 
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
    }}>
      {/* Main Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 4,
            height: 24,
            backgroundColor: '#10B981',
            borderRadius: 2,
            marginRight: 12,
          }} />
          <Text style={{
            fontSize: 24,
            fontWeight: '800',
            color: colors.text,
            letterSpacing: -0.5,
          }}>
            Alerts
          </Text>
          {unreadCount > 0 && (
            <View style={{
              backgroundColor: '#EF4444',
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 12,
            }}>
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '700',
              }}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        {/* Mark All Read Button on Right */}
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={{
              backgroundColor: '#10B981',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontWeight: '600',
            }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter and Clear Actions */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={() => setShowUnreadOnly(!showUnreadOnly)}
          style={{
            flex: 1,
            backgroundColor: showUnreadOnly ? '#10B981' : colors.surface,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: showUnreadOnly ? '#10B981' : (colors.border || 'rgba(0, 0, 0, 0.1)'),
          }}
        >
          <Text style={{
            textAlign: 'center',
            fontSize: 14,
            fontWeight: '600',
            color: showUnreadOnly ? 'white' : colors.text,
          }}>
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleClearAll}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.border || 'rgba(239, 68, 68, 0.2)',
          }}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#EF4444',
          }}>
            Clear All
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 60,
      paddingHorizontal: 32,
    }}>
      <View style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: colors.border || 'rgba(16, 185, 129, 0.2)',
        borderStyle: 'dashed',
      }}>
        <Ionicons name="notifications-outline" size={36} color="#10B981" />
      </View>
      <Text style={{
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
      }}>
        {showUnreadOnly ? 'No Unread Alerts' : 'All Caught Up!'}
      </Text>
      <Text style={{
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
      }}>
        {showUnreadOnly 
          ? "You don't have any unread notifications at the moment."
          : "You're all set! New notifications will appear here when they arrive."
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