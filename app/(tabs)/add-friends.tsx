import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';

export default function AddFriendsScreen() {
  const { colors, isDarkMode } = useTheme();
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
          profilePicture={user.profilePicture}
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
            🤝 Travel Buddies
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
          🌍 wants to be travel buddies
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
          ✈️ Travel buddy request sent
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
      className="flex-1 py-3 items-center rounded-lg"
      style={{ 
        backgroundColor: activeTab === tab ? '#10B981' : colors.surface,
        marginHorizontal: 4,
      }}
    >
      <Text 
        className="font-semibold text-sm"
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
          ? '🌍 No fellow travelers found. Try exploring with different keywords!'
          : '🧭 Discover amazing travel buddies to share your adventures with!';
      case 'received':
        return '📬 No adventure invites yet. Share your wanderlust spirit!';
      case 'sent':
        return '📮 No buddy requests sent yet. Start connecting with fellow explorers!';
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
      <View style={{ 
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
      }}>
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
              🧭 Travel Buddies
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/notifications')}
            style={{
              backgroundColor: '#10B981',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Ionicons name="notifications" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar (only show in search tab) */}
        {activeTab === 'search' && (
          <View 
            className="flex-row items-center p-3 rounded-xl mb-4"
            style={{ 
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: '#10B981'
            }}
          >
            <Ionicons name="search" size={20} color="#10B981" />
            <TextInput
              className="flex-1 ml-3"
              placeholder="Find your travel buddy..."
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
        <View className="flex-row">
          {renderTabButton('search', 'Discover')}
          {renderTabButton('received', 'Invites', friendRequests.length)}
          {renderTabButton('sent', 'Requests', sentRequests.length)}
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
                className="w-24 h-24 rounded-full items-center justify-center mb-6 shadow-lg"
                style={{ 
                  backgroundColor: '#10B981',
                  elevation: 8,
                  shadowColor: '#10B981',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8
                }}
              >
                <Ionicons 
                  name={
                    activeTab === 'search' ? 'compass-outline' : 
                    activeTab === 'received' ? 'mail-outline' : 'paper-plane-outline'
                  } 
                  size={36} 
                  color="white" 
                />
              </View>
              <Text 
                className="text-center text-base px-8 leading-6"
                style={{ color: colors.textSecondary }}
              >
                {getEmptyStateMessage()}
              </Text>
              {activeTab === 'search' && !searchQuery.trim() && (
                <View className="mt-4 px-6">
                  <Text 
                    className="text-center text-sm"
                    style={{ color: '#10B981' }}
                  >
                    💡 Tip: Connect with travelers who share your passion for exploration!
                  </Text>
                </View>
              )}
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}