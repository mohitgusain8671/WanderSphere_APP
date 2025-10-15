import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../store';
import { capitalize } from '../utils/helpers';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UserProfileViewProps {
  visible: boolean;
  userId: string;
  onClose: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  visible,
  userId,
  onClose,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { 
    getUserById, 
    getUserPosts, 
    user: currentUser,
    friends,
    sentRequests,
    friendRequests,
    sendFriendRequest,
    createChat,
  } = useAppStore();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<string>('none');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');

  useEffect(() => {
    if (visible && userId) {
      loadUserProfile();
      loadUserPosts();
      checkFriendshipStatus();
    }
  }, [visible, userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUserById(userId);
      if (result.success) {
        setUserProfile(result.data.user);
      } else {
        setError(result.error || 'Failed to load user profile');
      }
    } catch (error) {
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    setPostsLoading(true);
    try {
      const result = await getUserPosts(userId, 1);
      if (result.success) {
        setUserPosts(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load user posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const checkFriendshipStatus = async () => {
    if (userId === currentUser?._id) {
      setFriendshipStatus('self');
      return;
    }

    // Check if already friends
    const isFriend = friends.some((friend: any) => friend._id === userId);
    if (isFriend) {
      setFriendshipStatus('friends');
      return;
    }

    // Check if request sent
    const requestSent = sentRequests.some((req: any) => req.recipient._id === userId);
    if (requestSent) {
      setFriendshipStatus('pending');
      return;
    }

    // Check if request received
    const requestReceived = friendRequests.some((req: any) => req.requester._id === userId);
    if (requestReceived) {
      setFriendshipStatus('received');
      return;
    }

    setFriendshipStatus('none');
  };

  const handleFollow = async () => {
    if (friendshipStatus === 'none') {
      await sendFriendRequest(userId);
      setFriendshipStatus('pending');
    }
  };

  const handleMessage = async () => {
    try {
      const result = await createChat(userId);
      if (result.success) {
        // Close the profile modal first
        onClose();
        
        // Navigate to the chat using router.navigate for dynamic routes
        router.navigate({
          pathname: '/(tabs)/chat/[chatId]' as any,
          params: { 
            chatId: result.data._id,
            chatName: `${userProfile?.firstName} ${userProfile?.lastName}`
          }
        });
      } else {
        console.error('Failed to create chat:', result.error);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Filter posts by selected country
  const filteredPosts = selectedCountry === 'All Countries' 
    ? userPosts 
    : userPosts.filter((post: any) => post.location?.country === selectedCountry);

  // Get unique countries from user's posts
  const uniqueCountries = userPosts
    .filter((post: any) => post.location?.country)
    .map((post: any) => post.location.country)
    .filter((country: any, index: number, array: any[]) => array.indexOf(country) === index);
  const countries = ['All Countries', ...uniqueCountries];

  const profileStats = {
    postsCount: filteredPosts.length,
    followersCount: friends.length, // TODO: Get from API
    followingCount: 0, // TODO: Get from API
    likesCount: filteredPosts.reduce((total: number, post: any) => total + (post.likesCount || 0), 0),
  };

  const transformedPosts = filteredPosts.map((post: any) => ({
    id: post._id,
    type: post.mediaFiles?.length > 1 ? 'carousel' : 
         post.mediaFiles?.[0]?.type === 'video' ? 'video' : 'photo' as const,
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    thumbnail: post.mediaFiles?.[0]?.url || null,
    content: post.description,
    location: post.location
  }));

  const StatCard = ({ title, value, icon, color }: any) => (
    <TouchableOpacity
      style={{
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)',
        borderRadius: 18,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
        elevation: 2,
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
          elevation: 4,
          shadowColor: color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
      >
        <Ionicons name={icon} size={22} color="white" />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '900',
          color: colors.text,
          marginBottom: 4,
          textAlign: 'center',
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: colors.textSecondary,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1,
          textAlign: 'center',
        }}
      >
        {title === 'Posts' ? 'POSTS' : title === 'Followers' ? 'FOLLOWERS' : title === 'Following' ? 'FOLLOWING' : 'LIKES'}
      </Text>
    </TouchableOpacity>
  );

  const CountryFilter = () => (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: '600', 
        color: colors.text,
        marginBottom: 12
      }}>
        Filter by Country
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {countries.map((country, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedCountry(country as string)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor: selectedCountry === country 
                ? '#3B82F6' 
                : isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.8)',
              borderWidth: 1,
              borderColor: selectedCountry === country
                ? '#3B82F6'
                : isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
            }}
          >
            <Text style={{
              color: selectedCountry === country 
                ? '#fff' 
                : colors.text,
              fontSize: 14,
              fontWeight: selectedCountry === country ? '600' : '400'
            }}>
              {country} {country !== 'All Countries' && `(${userPosts.filter((p: any) => p.location?.country === country).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const PostGrid = ({ posts }: any) => (
    <View>
      <CountryFilter />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
      {posts.length === 0 ? (
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            paddingVertical: 80,
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.6)',
            borderRadius: 24,
            marginHorizontal: 4,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              borderWidth: 3,
              borderStyle: 'dashed',
              borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
              elevation: 4,
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
          >
            <Ionicons name="camera" size={48} color="#3B82F6" />
          </View>
          <Text
            style={{
              fontSize: 26,
              fontWeight: '900',
              color: colors.text,
              marginBottom: 12,
              letterSpacing: -0.5,
            }}
          >
            No Adventures Yet
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
              lineHeight: 24,
              paddingHorizontal: 20,
            }}
          >
            This traveler hasn't shared their{'\n'}journey yet. Stay tuned for amazing adventures!
          </Text>
        </View>
      ) : (
        posts.map((post: any, index: number) => {
          const itemWidth = (SCREEN_WIDTH - 56) / 2;
          return (
            <TouchableOpacity
              key={post.id}
              style={{
                width: itemWidth,
                height: itemWidth * 1.25,
                borderRadius: 20,
                overflow: 'hidden',
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                elevation: 6,
                shadowColor: isDarkMode ? '#000' : '#3B82F6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
              }}
            >
              {post.thumbnail ? (
                <Image
                  source={{ uri: post.thumbnail }}
                  style={{
                    width: '100%',
                    height: '72%',
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: '72%',
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={post.type === 'video' ? 'play' : 'image'}
                    size={32}
                    color="#3B82F6"
                  />
                </View>
              )}
              
              <View style={{ 
                padding: 14,
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}>
                    <Ionicons name="heart" size={14} color="#EF4444" />
                    <Text
                      style={{
                        marginLeft: 4,
                        fontSize: 12,
                        fontWeight: '700',
                        color: '#EF4444',
                      }}
                    >
                      {post.likesCount}
                    </Text>
                  </View>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}>
                    <Ionicons name="chatbubble" size={12} color="#3B82F6" />
                    <Text
                      style={{
                        marginLeft: 4,
                        fontSize: 12,
                        fontWeight: '700',
                        color: '#3B82F6',
                      }}
                    >
                      {post.commentsCount}
                    </Text>
                  </View>
                </View>
              </View>
              
              {post.type === 'video' && (
                <View
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: 16,
                    padding: 8,
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  }}
                >
                  <Ionicons name="play" size={14} color="white" />
                </View>
              )}
              
              {post.type === 'carousel' && (
                <View
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: 16,
                    padding: 8,
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  }}
                >
                  <Ionicons name="copy" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
        }}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        
        {/* Travel-Themed Header */}
        <View
          style={{
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            borderBottomWidth: 1.5,
            borderBottomColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
            paddingTop: 16,
            paddingBottom: 24,
            paddingHorizontal: 24,
            elevation: 4,
            shadowColor: isDarkMode ? '#10B981' : '#059669',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: colors.text,
                  letterSpacing: -0.5,
                }}
              >
                Travel Profile
              </Text>
            </View>
            
            <TouchableOpacity onPress={handleMessage}>
              <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text
              style={{
                marginTop: 16,
                fontSize: 16,
                color: colors.textSecondary,
              }}
            >
              Loading profile...
            </Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text
              style={{
                marginTop: 16,
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                textAlign: 'center',
              }}
            >
              Error Loading Profile
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={loadUserProfile}
              style={{
                marginTop: 20,
                backgroundColor: '#10B981',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingBottom: 40,
              paddingTop: 8,
            }}
            style={{
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.02)' : 'rgba(248, 250, 252, 0.02)',
            }}
          >
            {/* Professional Profile Card */}
            <View
              style={{
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                marginHorizontal: 16,
                marginBottom: 24,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.06)',
                elevation: 8,
                shadowColor: isDarkMode ? '#000' : '#3B82F6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
              }}
            >
              <View style={{ padding: 20 }}>
                {/* Profile Header */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginBottom: 24,
                }}>
                  {/* Profile Picture */}
                  <View style={{ marginRight: 20 }}>
                    <View
                      style={{
                        width: 85,
                        height: 85,
                        borderRadius: 42.5,
                        backgroundColor: '#10B981',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 3,
                        borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                        overflow: 'hidden',
                        elevation: 3,
                        shadowColor: '#10B981',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                      }}
                    >
                      {userProfile?.profilePicture ? (
                        <Image
                          source={{ uri: userProfile.profilePicture }}
                          style={{
                            width: '100%',
                            height: '100%',
                          }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="person"
                          size={36}
                          color="white"
                        />
                      )}
                    </View>
                    
                    {/* Status Indicator */}
                    <View style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: userProfile?.statusColor || '#10B981',
                      borderWidth: 2,
                      borderColor: colors.background,
                    }} />
                  </View>

                  {/* User Info */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: '800',
                        color: colors.text,
                        marginBottom: 6,
                        letterSpacing: -0.3,
                      }}
                    >
                      {capitalize(userProfile?.firstName || 'Travel')} {capitalize(userProfile?.lastName || 'Explorer')}
                    </Text>
                    
                    <Text
                      style={{
                        fontSize: 15,
                        color: colors.textSecondary,
                        fontWeight: '500',
                        marginBottom: 10,
                      }}
                    >
                      @{userProfile?.firstName?.toLowerCase() || 'explorer'}
                    </Text>

                    {/* Status */}
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      alignSelf: 'flex-start',
                    }}>
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: userProfile?.statusColor || '#10B981',
                          marginRight: 6,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: userProfile?.statusColor || '#10B981',
                          fontWeight: '700',
                        }}
                      >
                        {userProfile?.travelStatus || 'Ready to Explore'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bio */}
                {userProfile?.bio && (
                  <Text
                    style={{
                      fontSize: 15,
                      color: colors.text,
                      lineHeight: 22,
                      marginBottom: 20,
                      fontWeight: '500',
                    }}
                  >
                    {userProfile.bio}
                  </Text>
                )}

                {/* Badges */}
                {userProfile?.badges && userProfile.badges.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.textSecondary,
                        fontWeight: '700',
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      Travel Badges
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {userProfile.badges.map((badge: string, index: number) => (
                        <View
                          key={index}
                          style={{
                            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: '#10B981',
                              fontWeight: '700',
                            }}
                          >
                            {badge}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Action Buttons - Only show if not self and not already friends */}
                {friendshipStatus !== 'self' && friendshipStatus !== 'friends' && (
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                    <TouchableOpacity
                      onPress={handleFollow}
                      disabled={friendshipStatus === 'pending' || friendshipStatus === 'received'}
                      style={{
                        backgroundColor: friendshipStatus === 'pending' || friendshipStatus === 'received' 
                          ? colors.textSecondary 
                          : '#10B981',
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                        justifyContent: 'center',
                        opacity: friendshipStatus === 'pending' || friendshipStatus === 'received' ? 0.6 : 1,
                      }}
                    >
                      <Ionicons 
                        name={
                          friendshipStatus === 'pending' ? 'hourglass' :
                          friendshipStatus === 'received' ? 'mail' : 'person-add'
                        } 
                        size={16} 
                        color="white" 
                      />
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: '600',
                          marginLeft: 8,
                        }}
                      >
                        {friendshipStatus === 'pending' ? 'Request Sent' :
                         friendshipStatus === 'received' ? 'Respond to Request' : 'Add Friend'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleMessage}
                      style={{
                        backgroundColor: colors.surface,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      <Ionicons name="chatbubble" size={16} color={colors.text} />
                      <Text
                        style={{
                          color: colors.text,
                          fontWeight: '600',
                          marginLeft: 8,
                        }}
                      >
                        Message
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Stats Cards */}
            <View style={{ 
              flexDirection: 'row', 
              paddingHorizontal: 16, 
              marginBottom: 24,
              gap: 12,
            }}>
              <StatCard
                title="Posts"
                value={profileStats.postsCount}
                icon="camera"
                color="#3B82F6"
              />
              <StatCard
                title="Followers"
                value={profileStats.followersCount}
                icon="people"
                color="#10B981"
              />
              <StatCard
                title="Following"
                value={profileStats.followingCount}
                icon="person-add"
                color="#F59E0B"
              />
              <StatCard
                title="Likes"
                value={profileStats.likesCount}
                icon="heart"
                color="#EF4444"
              />
            </View>

            {/* Posts Section */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text,
                }}>
                  🌍 Travel Adventures
                </Text>
              </View>
              
              {postsLoading ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <ActivityIndicator size="small" color="#10B981" />
                  <Text
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      color: colors.textSecondary,
                    }}
                  >
                    Loading adventures...
                  </Text>
                </View>
              ) : (
                <PostGrid posts={transformedPosts} />
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};