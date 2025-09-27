import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { COLORS } from '../../utils/constants';

export default function AddFriendsScreen() {
  const { colors } = useTheme();
  const { 
    searchResults, 
    friendRequests, 
    sentRequests,
    searchUsers,
    sendFriendRequest,
    respondToFriendRequest,
    getFriendRequests,
    getSentFriendRequests,
    clearSearchResults
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'received' | 'sent'>('search');

  useEffect(() => {
    // Load friend requests on mount
    getFriendRequests();
    getSentFriendRequests();
  }, []);

  useEffect(() => {
    // Debounced search
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        clearSearchResults();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
  };

  const handleRespondRequest = async (friendshipId: string, action: 'accept' | 'decline') => {
    await respondToFriendRequest(friendshipId, action);
  };

  const renderSearchResult = ({ item: user }: { item: any }) => (
    <View 
      className="flex-row items-center p-4 mb-2 rounded-xl"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="mr-3">
        <ProfileAvatar 
          size={48} 
          userId={user._id}
          style={{ backgroundColor: colors.background }}
        />
      </View>
      
      <View className="flex-1">
        <Text 
          className="font-semibold text-base"
          style={{ color: colors.text }}
        >
          {user.firstName} {user.lastName}
        </Text>
        <Text 
          className="text-sm"
          style={{ color: colors.textSecondary }}
        >
          {user.email}
        </Text>
        {user.bio && (
          <Text 
            className="text-sm mt-1"
            style={{ color: colors.textSecondary }}
            numberOfLines={1}
          >
            {user.bio}
          </Text>
        )}
      </View>
      
      <View>
        {user.friendshipStatus === 'none' && (
          <Button
            title="Add Friend"
            onPress={() => handleSendRequest(user._id)}
            size="sm"
          />
        )}
        {user.friendshipStatus === 'pending' && user.isRequester && (
          <Text 
            className="text-sm px-3 py-1 rounded-full"
            style={{ 
              color: colors.textSecondary,
              backgroundColor: colors.background 
            }}
          >
            Sent
          </Text>
        )}
        {user.friendshipStatus === 'pending' && !user.isRequester && (
          <View className="flex-row space-x-2">
            <Button
              title="Accept"
              onPress={() => handleRespondRequest(user.friendshipId, 'accept')}
              size="sm"
            />
          </View>
        )}
        {user.friendshipStatus === 'accepted' && (
          <Text 
            className="text-sm px-3 py-1 rounded-full"
            style={{ 
              color: '#10B981',
              backgroundColor: colors.background 
            }}
          >
            Friends
          </Text>
        )}
      </View>
    </View>
  );

  const renderFriendRequest = ({ item: request }: { item: any }) => (
    <View 
      className="flex-row items-center p-4 mb-2 rounded-xl"
      style={{ backgroundColor: colors.surface }}
    >
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: colors.background }}
      >
        {request.requester.profilePicture ? (
          <Image
            source={{ uri: request.requester.profilePicture }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <Ionicons name="person" size={24} color={colors.text} />
        )}
      </View>
      
      <View className="flex-1">
        <Text 
          className="font-semibold text-base"
          style={{ color: colors.text }}
        >
          {request.requester.firstName} {request.requester.lastName}
        </Text>
        <Text 
          className="text-sm"
          style={{ color: colors.textSecondary }}
        >
          wants to be friends
        </Text>
      </View>
      
      <View className="flex-row space-x-2">
        <Button
          title="Accept"
          onPress={() => handleRespondRequest(request._id, 'accept')}
          size="sm"
        />
        <Button
          title="Decline"
          onPress={() => handleRespondRequest(request._id, 'decline')}
          variant="outline"
          size="sm"
        />
      </View>
    </View>
  );

  const renderSentRequest = ({ item: request }: { item: any }) => (
    <View 
      className="flex-row items-center p-4 mb-2 rounded-xl"
      style={{ backgroundColor: colors.surface }}
    >
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: colors.background }}
      >
        {request.recipient.profilePicture ? (
          <Image
            source={{ uri: request.recipient.profilePicture }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <Ionicons name="person" size={24} color={colors.text} />
        )}
      </View>
      
      <View className="flex-1">
        <Text 
          className="font-semibold text-base"
          style={{ color: colors.text }}
        >
          {request.recipient.firstName} {request.recipient.lastName}
        </Text>
        <Text 
          className="text-sm"
          style={{ color: colors.textSecondary }}
        >
          Friend request sent
        </Text>
      </View>
      
      <Text 
        className="text-sm px-3 py-1 rounded-full"
        style={{ 
          color: colors.textSecondary,
          backgroundColor: colors.background 
        }}
      >
        Pending
      </Text>
    </View>
  );

  const renderTabButton = (tab: 'search' | 'received' | 'sent', title: string, count?: number) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`flex-1 py-3 items-center rounded-lg ${activeTab === tab ? '' : ''}`}
      style={{ 
        backgroundColor: activeTab === tab ? COLORS.primary : colors.surface 
      }}
    >
      <Text 
        className="font-semibold"
        style={{ 
          color: activeTab === tab ? 'white' : colors.text 
        }}
      >
        {title}
        {count !== undefined && count > 0 && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'search':
        return searchQuery.trim() 
          ? 'No users found. Try a different search term.'
          : 'Search for friends by name or email address.';
      case 'received':
        return 'No friend requests received yet.';
      case 'sent':
        return 'No friend requests sent yet.';
      default:
        return '';
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'search':
        return searchResults;
      case 'received':
        return friendRequests;
      case 'sent':
        return sentRequests;
      default:
        return [];
    }
  };

  const getCurrentRenderItem = () => {
    switch (activeTab) {
      case 'search':
        return renderSearchResult;
      case 'received':
        return renderFriendRequest;
      case 'sent':
        return renderSentRequest;
      default:
        return renderSearchResult;
    }
  };

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <Text 
          className="text-2xl font-bold mb-4"
          style={{ color: colors.text }}
        >
          Add Friends
        </Text>

        {/* Search Bar (only show in search tab) */}
        {activeTab === 'search' && (
          <View 
            className="flex-row items-center p-3 rounded-xl mb-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              className="flex-1 ml-3"
              placeholder="Search by name or email..."
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tab Buttons */}
        <View className="flex-row space-x-2">
          {renderTabButton('search', 'Search')}
          {renderTabButton('received', 'Received', friendRequests.length)}
          {renderTabButton('sent', 'Sent', sentRequests.length)}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-4">
        <FlatList
          data={getCurrentData()}
          renderItem={getCurrentRenderItem()}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              <View 
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons 
                  name={
                    activeTab === 'search' ? 'search' : 
                    activeTab === 'received' ? 'person-add' : 'send'
                  } 
                  size={32} 
                  color={colors.textSecondary} 
                />
              </View>
              <Text 
                className="text-center text-base"
                style={{ color: colors.textSecondary }}
              >
                {getEmptyStateMessage()}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}