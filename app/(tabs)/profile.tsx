import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { USER_ROLES } from '../../utils/constants';
import { capitalize } from '../../utils/helpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function UniqueProfileScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { 
    user, 
    updateUserProfile,
    logout,
    posts,
    friends,
    friendRequests,
    sentRequests,
    storyGroups,
    getPosts,
    getFriends,
    getStories
  } = useAppStore();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedTab, setSelectedTab] = useState('posts');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const scrollY = new Animated.Value(0);

  // Dynamic profile elements with defaults
  const [profileData, setProfileData] = useState({
    travelStatus: user?.travelStatus || 'Ready to Explore',
    statusColor: user?.statusColor || '#10B981',
    badges: user?.badges || ['Explorer', 'Photographer', 'Adventurer'],
    bio: user?.bio || '✈️ Travel enthusiast exploring the world one destination at a time 🌍 Creating memories and sharing adventures 📸',
    profilePicture: user?.profilePicture || null
  });

  // Update profileData when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        travelStatus: user.travelStatus || 'Ready to Explore',
        statusColor: user.statusColor || '#10B981',
        badges: user.badges || ['Explorer', 'Photographer', 'Adventurer'],
        bio: user.bio || '✈️ Travel enthusiast exploring the world one destination at a time 🌍 Creating memories and sharing adventures 📸',
        profilePicture: user.profilePicture || null
      });
    }
  }, [user]);

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      }
      
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera permissions to take photos!');
      }
    })();
  }, []);

  // Image picker functions
  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileData({
          ...profileData,
          profilePicture: result.assets[0].uri
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileData({
          ...profileData,
          profilePicture: result.assets[0].uri
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Available travel statuses
  const travelStatuses = [
    { text: 'Ready to Explore', color: '#10B981' },
    { text: 'Currently Traveling', color: '#3B82F6' },
    { text: 'Planning Next Trip', color: '#F59E0B' },
    { text: 'Back Home', color: '#6B7280' },
    { text: 'Adventure Mode', color: '#EF4444' }
  ];

  // Available badges
  const availableBadges = [
    { name: 'Explorer', icon: 'earth', color: '#10B981' },
    { name: 'Photographer', icon: 'camera', color: '#F59E0B' },
    { name: 'Adventurer', icon: 'heart', color: '#EF4444' },
    { name: 'Foodie', icon: 'restaurant', color: '#8B5CF6' },
    { name: 'Hiker', icon: 'walk', color: '#059669' },
    { name: 'Beach Lover', icon: 'sunny', color: '#06B6D4' },
    { name: 'City Explorer', icon: 'business', color: '#6366F1' },
    { name: 'Solo Traveler', icon: 'person', color: '#EC4899' }
  ];

  // Real data
  const userPosts = posts.filter((post: any) => post.author._id === user?._id);
  
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
    followersCount: friends.length,
    followingCount: sentRequests.filter((req: any) => req.status === 'accepted').length,
    likesCount: filteredPosts.reduce((total: number, post: any) => total + (post.likesCount || 0), 0),
  };

  const transformedPosts = filteredPosts.map((post: any) => ({
    id: post._id,
    type: post.images?.length > 1 ? 'carousel' : post.video ? 'video' : 'photo' as const,
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    thumbnail: post.images?.[0] || post.video || null,
    content: post.content,
    location: post.location
  }));

  useEffect(() => {
    const loadUserData = async () => {
      if (user?._id) {
        await getPosts(1, user._id);
        await getFriends();
        await getStories();
      }
    };
    loadUserData();
  }, [user?._id]);

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
          gap: 8,
        }}
      >
      {posts.length === 0 ? (
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            paddingVertical: 60,
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
            }}
          >
            <Ionicons name="camera" size={40} color="#3B82F6" />
          </View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Share Your Journey
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 22,
            }}
          >
            Start documenting your travel adventures{'\n'}and inspiring others
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/add-post')}
            style={{
              backgroundColor: '#3B82F6',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 25,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="add" size={20} color="white" style={{ marginRight: 8 }} />
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              Create First Post
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        posts.map((post: any, index: number) => {
          const itemWidth = (SCREEN_WIDTH - 48) / 2;
          return (
            <TouchableOpacity
              key={post.id}
              onPress={() => console.log('Post pressed:', post.id)}
              style={{
                width: itemWidth,
                height: itemWidth * 1.2,
                borderRadius: 16,
                overflow: 'hidden',
                backgroundColor: colors.surface,
                marginBottom: 12,
              }}
            >
              {post.thumbnail ? (
                <Image
                  source={{ uri: post.thumbnail }}
                  style={{
                    width: '100%',
                    height: '75%',
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: '75%',
                    backgroundColor: colors.border,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={post.type === 'video' ? 'play' : 'image'}
                    size={30}
                    color={colors.textSecondary}
                  />
                </View>
              )}
              
              <View style={{ padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="heart" size={14} color="#EF4444" />
                    <Text
                      style={{
                        marginLeft: 4,
                        fontSize: 12,
                        fontWeight: '600',
                        color: colors.textSecondary,
                      }}
                    >
                      {post.likesCount}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="chatbubble" size={12} color="#3B82F6" />
                    <Text
                      style={{
                        marginLeft: 4,
                        fontSize: 12,
                        fontWeight: '600',
                        color: colors.textSecondary,
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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: 12,
                    padding: 4,
                  }}
                >
                  <Ionicons name="play" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}
      </View>
    </View>
  );

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        paddingBottom: 100 // Add space for bottom tab bar
      }}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Modern Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 16,
          backgroundColor: colors.background,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '900',
              color: colors.text,
              letterSpacing: -1,
              marginBottom: 4,
            }}
          >
            Profile
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              fontWeight: '500',
            }}
          >
            Your travel journey
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/add-post')}
            style={{
              backgroundColor: '#3B82F6',
              borderRadius: 20,
              padding: 14,
              elevation: 8,
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Ionicons name="add" size={22} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setShowSettings(!showSettings)}
            style={{
              backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              borderRadius: 20,
              padding: 14,
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
            }}
          >
            <Ionicons name="menu" size={22} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Traveller Profile Card */}
        <View
          style={{
            backgroundColor: colors.background,
            marginHorizontal: 20,
            paddingHorizontal: 20,
            paddingVertical: 24,
            marginBottom: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            elevation: 2,
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
        >
          {/* Profile Info - Left Aligned Layout */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 }}>
            {/* Profile Picture - Left Side */}
            <View style={{ marginRight: 16 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#3B82F6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 3,
                  borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                  elevation: 4,
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  overflow: 'hidden',
                }}
              >
                {user?.profilePicture ? (
                  <Image
                    source={{ uri: user.profilePicture }}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="airplane"
                    size={32}
                    color="white"
                  />
                )}
              </View>
              
              {isAdmin && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#F59E0B',
                    borderRadius: 8,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 8,
                      fontWeight: '800',
                    }}
                  >
                    ADMIN
                  </Text>
                </View>
              )}
            </View>

            {/* Name and Info - Right Side */}
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '800',
                  color: colors.text,
                  marginBottom: 4,
                  letterSpacing: -0.5,
                }}
              >
                {capitalize(user?.firstName || '')} {capitalize(user?.lastName || '')}
              </Text>
              
              <View
                style={{
                  backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  alignSelf: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: '#3B82F6',
                    fontWeight: '600',
                  }}
                >
                  @{user?.firstName?.toLowerCase() || 'wanderer'}
                </Text>
              </View>

              {/* Dynamic Travel Status */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: profileData.statusColor,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: profileData.statusColor,
                    fontWeight: '600',
                  }}
                >
                  {profileData.travelStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* Dynamic Travel Bio */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                lineHeight: 20,
                textAlign: 'left',
              }}
            >
              {profileData.bio}
            </Text>
          </View>

          {/* Dynamic Travel Badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {profileData.badges.map((badgeName: string, index: number) => {
              const badge = availableBadges.find(b => b.name === badgeName);
              if (!badge) return null;
              
              return (
                <View
                  key={index}
                  style={{
                    backgroundColor: isDarkMode 
                      ? `${badge.color}25` 
                      : `${badge.color}15`,
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons 
                    name={badge.icon as any} 
                    size={12} 
                    color={badge.color} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: badge.color,
                      fontWeight: '600',
                    }}
                  >
                    {badge.name}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Instagram Style Stats */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingHorizontal: 20,
              paddingVertical: 20,
              marginBottom: 8,
            }}
          >
            <TouchableOpacity style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: colors.text,
                  marginBottom: 2,
                }}
              >
                {profileStats.postsCount}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  fontWeight: '400',
                }}
              >
                Posts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: colors.text,
                  marginBottom: 2,
                }}
              >
                {profileStats.followersCount}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  fontWeight: '400',
                }}
              >
                Followers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: colors.text,
                  marginBottom: 2,
                }}
              >
                {profileStats.followingCount}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  fontWeight: '400',
                }}
              >
                Following
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 8 }}>
            <TouchableOpacity
              onPress={() => setShowEditProfile(true)}
              style={{
                flex: 1,
                backgroundColor: '#3B82F6',
                borderRadius: 25,
                paddingVertical: 16,
                alignItems: 'center',
                elevation: 4,
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                Edit Profile
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                borderRadius: 25,
                paddingVertical: 16,
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
              }}
            >
              <Text
                style={{
                  color: '#3B82F6',
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                Share Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Tabs */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            marginBottom: 24,
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(248, 250, 252, 0.5)',
            borderRadius: 20,
            padding: 6,
            marginHorizontal: 20,
          }}
        >
          {['posts', 'stories', 'saved'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: selectedTab === tab 
                  ? '#3B82F6'
                  : 'transparent',
                borderRadius: 16,
                marginHorizontal: 2,
                elevation: selectedTab === tab ? 4 : 0,
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: selectedTab === tab ? 0.3 : 0,
                shadowRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: selectedTab === tab ? '800' : '600',
                  color: selectedTab === tab ? 'white' : colors.textSecondary,
                  textTransform: 'capitalize',
                  textAlign: 'center',
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts Grid */}
        <PostGrid posts={transformedPosts} />
      </ScrollView>

      {/* Settings Modal */}
      {showSettings && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowSettings(false)}
          />
          
          <BlurView
            intensity={100}
            tint={isDarkMode ? 'dark' : 'light'}
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 20,
              paddingBottom: 40,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: colors.border,
                alignSelf: 'center',
                borderRadius: 2,
                marginBottom: 20,
              }}
            />

            <TouchableOpacity
              onPress={toggleTheme}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}
            >
              <Ionicons
                name={isDarkMode ? 'sunny' : 'moon'}
                size={24}
                color={colors.text}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginLeft: 16,
                }}
              >
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={logout}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color="#EF4444"
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#EF4444',
                  marginLeft: 16,
                }}
              >
                Sign Out
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <BlurView
            intensity={80}
            style={{
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderRadius: 20,
              padding: 24,
              width: SCREEN_WIDTH - 40,
              maxHeight: SCREEN_HEIGHT - 100,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  Edit Profile
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.textSecondary,
                  }}
                >
                  Customize your travel profile
                </Text>
              </View>

              {/* Profile Picture Editor */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 16,
                  }}
                >
                  Profile Picture
                </Text>
                
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Profile Picture',
                      'Choose an option',
                      [
                        {
                          text: 'Take Photo',
                          onPress: takePhoto
                        },
                        {
                          text: 'Choose from Gallery',
                          onPress: pickImageFromGallery
                        },
                        {
                          text: 'Remove Picture',
                          onPress: () => {
                            setProfileData({ ...profileData, profilePicture: null });
                          },
                          style: 'destructive'
                        },
                        {
                          text: 'Cancel',
                          style: 'cancel'
                        }
                      ]
                    );
                  }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: '#3B82F6',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 3,
                    borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                    elevation: 4,
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {profileData.profilePicture ? (
                    <>
                      <Image
                        source={{ uri: profileData.profilePicture }}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: '#3B82F6',
                          borderRadius: 12,
                          padding: 4,
                          borderWidth: 2,
                          borderColor: 'white',
                        }}
                      >
                        <Ionicons name="camera" size={12} color="white" />
                      </View>
                    </>
                  ) : (
                    <>
                      <Ionicons name="airplane" size={40} color="white" />
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: '#10B981',
                          borderRadius: 12,
                          padding: 4,
                          borderWidth: 2,
                          borderColor: 'white',
                        }}
                      >
                        <Ionicons name="add" size={12} color="white" />
                      </View>
                    </>
                  )}
                </TouchableOpacity>
                
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginTop: 12,
                    textAlign: 'center',
                  }}
                >
                  Tap to change your profile picture
                </Text>
              </View>

              {/* Travel Status Selection */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 12,
                  }}
                >
                  Travel Status
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {travelStatuses.map((status, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setProfileData({
                        ...profileData,
                        travelStatus: status.text,
                        statusColor: status.color
                      })}
                      style={{
                        backgroundColor: profileData.travelStatus === status.text 
                          ? status.color 
                          : isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(248, 250, 252, 0.8)',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: profileData.travelStatus === status.text 
                          ? status.color 
                          : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: profileData.travelStatus === status.text 
                            ? 'white' 
                            : colors.text,
                          fontWeight: '600',
                          fontSize: 12,
                        }}
                      >
                        {status.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Bio Text Editor */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 12,
                  }}
                >
                  Bio
                </Text>
                <TextInput
                  value={profileData.bio}
                  onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
                  placeholder="Tell others about your travel story..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  maxLength={150}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(248, 250, 252, 0.8)',
                    borderRadius: 16,
                    padding: 16,
                    color: colors.text,
                    fontSize: 15,
                    lineHeight: 20,
                    textAlignVertical: 'top',
                    minHeight: 100,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    textAlign: 'right',
                    marginTop: 8,
                  }}
                >
                  {profileData.bio.length}/150 characters
                </Text>
              </View>

              {/* Badges Selection */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 12,
                  }}
                >
                  Travel Badges (Select up to 4)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {availableBadges.map((badge, index) => {
                    const isSelected = profileData.badges.includes(badge.name);
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          if (isSelected) {
                            setProfileData({
                              ...profileData,
                              badges: profileData.badges.filter((b: string) => b !== badge.name)
                            });
                          } else if (profileData.badges.length < 4) {
                            setProfileData({
                              ...profileData,
                              badges: [...profileData.badges, badge.name]
                            });
                          }
                        }}
                        style={{
                          backgroundColor: isSelected 
                            ? badge.color 
                            : isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(248, 250, 252, 0.8)',
                          borderRadius: 12,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: isSelected ? badge.color : colors.border,
                        }}
                      >
                        <Ionicons 
                          name={badge.icon as any} 
                          size={12} 
                          color={isSelected ? 'white' : badge.color} 
                          style={{ marginRight: 4 }} 
                        />
                        <Text
                          style={{
                            color: isSelected ? 'white' : badge.color,
                            fontWeight: '600',
                            fontSize: 11,
                          }}
                        >
                          {badge.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowEditProfile(false)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.border,
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    // Save profile updates to user store
                    updateUserProfile({
                      profilePicture: profileData.profilePicture,
                      travelStatus: profileData.travelStatus,
                      statusColor: profileData.statusColor,
                      badges: profileData.badges,
                      bio: profileData.bio
                    });
                    setShowEditProfile(false);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#3B82F6',
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  >
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </BlurView>
        </View>
      )}
    </SafeAreaView>
  );
}