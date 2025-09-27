import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Share,
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [showActionDrawer, setShowActionDrawer] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const scrollY = new Animated.Value(0);
  const drawerAnimation = new Animated.Value(0);

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

  // Social Media Sharing Functions
  const shareProfile = async () => {
    try {
      const profileUrl = `https://wandersphere.app/profile/${user?._id}`;
      const shareMessage = `Check out ${user?.firstName} ${user?.lastName}'s travel profile on WanderSphere! 🌍✈️\n\n${profileData.bio}\n\n📍 ${profileStats.postsCount} travel posts\n👥 ${profileStats.followersCount} followers\n\n${profileUrl}`;
      
      const result = await Share.share({
        message: shareMessage,
        url: profileUrl,
        title: `${user?.firstName}'s Travel Profile - WanderSphere`
      });

      if (result.action === Share.sharedAction) {
        console.log('Profile shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share profile');
    }
  };

  const shareToWhatsApp = async () => {
    try {
      const profileUrl = `https://wandersphere.app/profile/${user?._id}`;
      const message = `Hey! Check out my travel adventures on WanderSphere 🌍✈️\n\n${user?.firstName} ${user?.lastName}\n${profileData.bio}\n\n📸 ${profileStats.postsCount} posts | 👥 ${profileStats.followersCount} followers\n\n${profileUrl}`;
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to web WhatsApp
        const webWhatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        await Linking.openURL(webWhatsappUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'WhatsApp not available');
    }
  };

  const shareToInstagram = async () => {
    try {
      const instagramUrl = 'instagram://';
      const canOpen = await Linking.canOpenURL(instagramUrl);
      
      if (canOpen) {
        // For Instagram, we can only open the app and let user manually share
        await Linking.openURL(instagramUrl);
        Alert.alert(
          'Share to Instagram',
          'Instagram has been opened. You can now create a story or post and mention your WanderSphere profile!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Instagram not installed', 'Please install Instagram to share');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open Instagram');
    }
  };

  const shareToTwitter = async () => {
    try {
      const profileUrl = `https://wandersphere.app/profile/${user?._id}`;
      const tweetText = `Check out my travel journey on @WanderSphere! 🌍✈️\n\n📸 ${profileStats.postsCount} adventures shared\n👥 ${profileStats.followersCount} travel buddies\n\n${profileUrl}`;
      const twitterUrl = `twitter://post?message=${encodeURIComponent(tweetText)}`;
      
      const canOpen = await Linking.canOpenURL(twitterUrl);
      if (canOpen) {
        await Linking.openURL(twitterUrl);
      } else {
        // Fallback to web Twitter
        const webTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        await Linking.openURL(webTwitterUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share to Twitter');
    }
  };

  const shareToFacebook = async () => {
    try {
      const profileUrl = `https://wandersphere.app/profile/${user?._id}`;
      const facebookUrl = `fb://facewebmodal/f?href=${encodeURIComponent(profileUrl)}`;
      
      const canOpen = await Linking.canOpenURL(facebookUrl);
      if (canOpen) {
        await Linking.openURL(facebookUrl);
      } else {
        // Fallback to web Facebook
        const webFacebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        await Linking.openURL(webFacebookUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share to Facebook');
    }
  };

  const showShareOptions = () => {
    setShowShareModal(true);
  };

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
            Share Your Journey
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
            Start documenting your travel adventures{'\n'}and inspiring others to explore the world
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/add-post')}
            style={{
              backgroundColor: '#3B82F6',
              paddingHorizontal: 40,
              paddingVertical: 18,
              borderRadius: 28,
              flexDirection: 'row',
              alignItems: 'center',
              elevation: 8,
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Ionicons name="add" size={22} color="white" style={{ marginRight: 10 }} />
            <Text
              style={{
                color: 'white',
                fontSize: 17,
                fontWeight: '800',
                letterSpacing: 0.5,
              }}
            >
              Create First Post
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        posts.map((post: any, index: number) => {
          const itemWidth = (SCREEN_WIDTH - 56) / 2;
          return (
            <TouchableOpacity
              key={post.id}
              onPress={() => console.log('Post pressed:', post.id)}
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
              
              {/* Enhanced Overlay Gradient */}
              <View style={{
                position: 'absolute',
                bottom: 28,
                left: 0,
                right: 0,
                height: 40,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
              }} />
              
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
              
              {/* Enhanced Media Type Indicator */}
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

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
        paddingBottom: 100 // Add space for bottom tab bar
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
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{
                width: 6,
                height: 32,
                backgroundColor: '#10B981',
                borderRadius: 3,
                marginRight: 12,
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
              }} />
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: colors.text,
                  letterSpacing: -0.8,
                }}
              >
                Profile
              </Text>
            </View>
            <Text
              style={{
                fontSize: 15,
                color: '#10B981',
                fontWeight: '600',
                marginLeft: 18,
                opacity: 0.9,
              }}
            >
              🌍 Your travel adventure starts here
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => setShowActionDrawer(true)}
            style={{
              padding: 12,
            }}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: 160,
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
                  backgroundColor: profileData.statusColor,
                  borderWidth: 2,
                  borderColor: colors.background,
                }} />
                
                {isAdmin && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      backgroundColor: '#F59E0B',
                      borderRadius: 8,
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                      borderWidth: 1,
                      borderColor: '#FCD34D',
                      elevation: 2,
                      shadowColor: '#F59E0B',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.3,
                      shadowRadius: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 8,
                        fontWeight: '900',
                      }}
                    >
                      🌟 VIP
                    </Text>
                  </View>
                )}
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
                  {capitalize(user?.firstName || 'Travel')} {capitalize(user?.lastName || 'Explorer')}
                </Text>
                
                <Text
                  style={{
                    fontSize: 15,
                    color: colors.textSecondary,
                    fontWeight: '500',
                    marginBottom: 10,
                  }}
                >
                  @{user?.firstName?.toLowerCase() || 'explorer'}
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
                      backgroundColor: profileData.statusColor,
                      marginRight: 6,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: profileData.statusColor,
                      fontWeight: '600',
                    }}
                  >
                    {profileData.travelStatus}
                  </Text>
                </View>
              </View>
            </View>

            {/* Travel Stats Section */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingVertical: 20,
                marginBottom: 20,
              }}
            >
              <TouchableOpacity style={{ alignItems: 'center', flex: 1 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '900',
                    color: colors.text,
                    marginBottom: 4,
                  }}
                >
                  {profileStats.postsCount || 0}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    fontWeight: '600',
                  }}
                >
                  Posts
                </Text>
              </TouchableOpacity>

              <View style={{
                width: 1,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                marginVertical: 8,
              }} />

              <TouchableOpacity style={{ alignItems: 'center', flex: 1 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '900',
                    color: colors.text,
                    marginBottom: 4,
                  }}
                >
                  {profileStats.followersCount || 0}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    fontWeight: '600',
                  }}
                >
                  Followers
                </Text>
              </TouchableOpacity>

              <View style={{
                width: 1,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                marginVertical: 8,
              }} />

              <TouchableOpacity style={{ alignItems: 'center', flex: 1 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '900',
                    color: colors.text,
                    marginBottom: 4,
                  }}
                >
                  {profileStats.followingCount || 0}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    fontWeight: '600',
                  }}
                >
                  Following
                </Text>
              </TouchableOpacity>
            </View>

            {/* Travel Bio Section */}
            <View style={{ 
              marginBottom: 20,
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.03)' : 'rgba(16, 185, 129, 0.02)',
              borderRadius: 12,
              padding: 16,
              borderLeftWidth: 3,
              borderLeftColor: '#10B981',
            }}>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.text,
                  lineHeight: 22,
                  letterSpacing: 0.2,
                  fontWeight: '500',
                }}
              >
                {profileData.bio}
              </Text>
            </View>

            {/* Travel Achievement Badges */}
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              gap: 10, 
              marginBottom: 24,
              paddingHorizontal: 2,
            }}>
              {profileData.badges.map((badgeName: string, index: number) => {
                const badge = availableBadges.find(b => b.name === badgeName);
                if (!badge) return null;
                
                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: isDarkMode 
                        ? `${badge.color}15` 
                        : `${badge.color}10`,
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
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


          </View>
        </View>

        {/* Professional Content Tabs */}
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 20,
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
            borderRadius: 24,
            padding: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
            elevation: 4,
            shadowColor: isDarkMode ? '#000' : '#3B82F6',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            {[
              { key: 'posts', label: 'Posts', icon: 'grid' },
              { key: 'stories', label: 'Stories', icon: 'play-circle' },
              { key: 'saved', label: 'Saved', icon: 'bookmark' }
            ].map((tab, index) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setSelectedTab(tab.key)}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  alignItems: 'center',
                  backgroundColor: selectedTab === tab.key 
                    ? '#10B981'
                    : 'transparent',
                  borderRadius: 18,
                  marginHorizontal: 4,
                  elevation: selectedTab === tab.key ? 6 : 0,
                  shadowColor: '#10B981',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: selectedTab === tab.key ? 0.4 : 0,
                  shadowRadius: 6,
                  borderWidth: selectedTab === tab.key ? 1 : 0,
                  borderColor: selectedTab === tab.key ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                }}
              >
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons 
                    name={tab.icon as any} 
                    size={18} 
                    color={selectedTab === tab.key ? 'white' : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: selectedTab === tab.key ? '800' : '600',
                      color: selectedTab === tab.key ? 'white' : colors.textSecondary,
                      letterSpacing: 0.3,
                    }}
                  >
                    {tab.label}
                  </Text>
                </View>
                
                {/* Active indicator */}
                {selectedTab === tab.key && (
                  <View style={{
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    marginLeft: -8,
                    width: 16,
                    height: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: 1,
                  }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
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

      {/* Professional Action Drawer */}
      {showActionDrawer && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowActionDrawer(false)}
          />
          
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: 280,
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
            }}
          >
            <BlurView
              intensity={100}
              tint={isDarkMode ? 'dark' : 'light'}
              style={{
                flex: 1,
                borderTopRightRadius: 24,
                borderBottomRightRadius: 24,
                overflow: 'hidden',
              }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Drawer Header */}
                <View style={{
                  paddingHorizontal: 24,
                  paddingVertical: 20,
                  paddingTop: 60,
                  borderBottomWidth: 1,
                  borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{
                      fontSize: 22,
                      fontWeight: '800',
                      color: colors.text,
                    }}>
                      Quick Actions
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowActionDrawer(false)}
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: 12,
                        padding: 8,
                      }}
                    >
                      <Ionicons name="close" size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Action Items */}
                <View style={{ paddingVertical: 20 }}>
                  {/* Edit Profile */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowActionDrawer(false);
                      setShowEditProfile(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      marginHorizontal: 12,
                      borderRadius: 16,
                      marginBottom: 8,
                      backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                    }}
                  >
                    <View style={{
                      backgroundColor: '#3B82F6',
                      borderRadius: 12,
                      padding: 10,
                      marginRight: 16,
                    }}>
                      <Ionicons name="create" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: colors.text,
                        marginBottom: 2,
                      }}>
                        Edit Profile
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}>
                        Update your travel profile
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Add Post */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowActionDrawer(false);
                      router.push('/(tabs)/add-post');
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      marginHorizontal: 12,
                      borderRadius: 16,
                      marginBottom: 8,
                      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    }}
                  >
                    <View style={{
                      backgroundColor: '#10B981',
                      borderRadius: 12,
                      padding: 10,
                      marginRight: 16,
                    }}>
                      <Ionicons name="add" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: colors.text,
                        marginBottom: 2,
                      }}>
                        Add Post
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}>
                        Share your travel moments
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Add Story */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowActionDrawer(false);
                      router.push('/(tabs)/add-story');
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      marginHorizontal: 12,
                      borderRadius: 16,
                      marginBottom: 8,
                      backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                    }}
                  >
                    <View style={{
                      backgroundColor: '#F59E0B',
                      borderRadius: 12,
                      padding: 10,
                      marginRight: 16,
                    }}>
                      <Ionicons name="play-circle" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: colors.text,
                        marginBottom: 2,
                      }}>
                        Add Story
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}>
                        Share quick travel updates
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Share Profile */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowActionDrawer(false);
                      showShareOptions();
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      marginHorizontal: 12,
                      borderRadius: 16,
                      marginBottom: 8,
                      backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                    }}
                  >
                    <View style={{
                      backgroundColor: '#8B5CF6',
                      borderRadius: 12,
                      padding: 10,
                      marginRight: 16,
                    }}>
                      <Ionicons name="share-social" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: colors.text,
                        marginBottom: 2,
                      }}>
                        Share Profile
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}>
                        Share your travel journey
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={{
                    height: 1,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    marginVertical: 16,
                    marginHorizontal: 24,
                  }} />

                  {/* Theme Toggle */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowActionDrawer(false);
                      toggleTheme();
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      marginHorizontal: 12,
                      borderRadius: 16,
                      marginBottom: 8,
                    }}
                  >
                    <View style={{
                      backgroundColor: isDarkMode ? '#FCD34D' : '#1F2937',
                      borderRadius: 12,
                      padding: 10,
                      marginRight: 16,
                    }}>
                      <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color={isDarkMode ? '#000' : '#FFF'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: colors.text,
                        marginBottom: 2,
                      }}>
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}>
                        Switch theme preference
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Settings */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowActionDrawer(false);
                      setShowSettings(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      marginHorizontal: 12,
                      borderRadius: 16,
                      marginBottom: 8,
                    }}
                  >
                    <View style={{
                      backgroundColor: '#6B7280',
                      borderRadius: 12,
                      padding: 10,
                      marginRight: 16,
                    }}>
                      <Ionicons name="settings" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: colors.text,
                        marginBottom: 2,
                      }}>
                        Settings
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}>
                        App preferences & more
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Logout */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowActionDrawer(false);
                      logout();
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      marginHorizontal: 12,
                      borderRadius: 16,
                      marginBottom: 20,
                    }}
                  >
                    <View style={{
                      backgroundColor: '#EF4444',
                      borderRadius: 12,
                      padding: 10,
                      marginRight: 16,
                    }}>
                      <Ionicons name="log-out" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: '#EF4444',
                        marginBottom: 2,
                      }}>
                        Sign Out
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}>
                        Logout from your account
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </View>
      )}

      {/* Share Profile Modal */}
      {showShareModal && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
            zIndex: 1000,
          }}
        >
          <BlurView
            intensity={100}
            tint={isDarkMode ? 'dark' : 'light'}
            style={{
              backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 40,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: colors.text
                }}>
                  🌍 Share Your Profile
                </Text>
                <TouchableOpacity
                  onPress={() => setShowShareModal(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Profile Preview */}
              <View style={{ 
                paddingHorizontal: 24, 
                paddingVertical: 20,
                alignItems: 'center'
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: '#3B82F6'
                }}>
                  <Text style={{ fontSize: 24 }}>🌍</Text>
                </View>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 4
                }}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: 16
                }}>
                  {profileStats.postsCount} posts • {profileStats.followersCount} followers
                </Text>
              </View>

              {/* Social Media Options */}
              <View style={{ paddingHorizontal: 24 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 16
                }}>
                  📱 Share on Social Media
                </Text>
                
                <View style={{ gap: 12 }}>
                  {/* WhatsApp */}
                  <TouchableOpacity
                    onPress={() => {
                      shareToWhatsApp();
                      setShowShareModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      backgroundColor: isDarkMode ? 'rgba(37, 211, 102, 0.1)' : 'rgba(37, 211, 102, 0.05)',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(37, 211, 102, 0.2)'
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#25D366',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}>
                      <Ionicons name="logo-whatsapp" size={24} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 2
                      }}>
                        WhatsApp
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary
                      }}>
                        Share with friends and family
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#25D366" />
                  </TouchableOpacity>

                  {/* Instagram */}
                  <TouchableOpacity
                    onPress={() => {
                      shareToInstagram();
                      setShowShareModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      backgroundColor: isDarkMode ? 'rgba(225, 48, 108, 0.1)' : 'rgba(225, 48, 108, 0.05)',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(225, 48, 108, 0.2)'
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#E1306C',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}>
                      <Ionicons name="logo-instagram" size={24} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 2
                      }}>
                        Instagram
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary
                      }}>
                        Share to your story or feed
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#E1306C" />
                  </TouchableOpacity>

                  {/* Twitter */}
                  <TouchableOpacity
                    onPress={() => {
                      shareToTwitter();
                      setShowShareModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      backgroundColor: isDarkMode ? 'rgba(29, 161, 242, 0.1)' : 'rgba(29, 161, 242, 0.05)',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(29, 161, 242, 0.2)'
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#1DA1F2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}>
                      <Ionicons name="logo-twitter" size={24} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 2
                      }}>
                        Twitter
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary
                      }}>
                        Tweet your travel journey
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#1DA1F2" />
                  </TouchableOpacity>

                  {/* Facebook */}
                  <TouchableOpacity
                    onPress={() => {
                      shareToFacebook();
                      setShowShareModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      backgroundColor: isDarkMode ? 'rgba(66, 103, 178, 0.1)' : 'rgba(66, 103, 178, 0.05)',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(66, 103, 178, 0.2)'
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#4267B2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}>
                      <Ionicons name="logo-facebook" size={24} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 2
                      }}>
                        Facebook
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary
                      }}>
                        Share with your network
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#4267B2" />
                  </TouchableOpacity>

                  {/* More Options */}
                  <TouchableOpacity
                    onPress={() => {
                      shareProfile();
                      setShowShareModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      backgroundColor: isDarkMode ? 'rgba(107, 114, 128, 0.1)' : 'rgba(107, 114, 128, 0.05)',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(107, 114, 128, 0.2)'
                    }}
                  >
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#6B7280',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}>
                      <Ionicons name="share-outline" size={24} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 2
                      }}>
                        More Options
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: colors.textSecondary
                      }}>
                        Email, SMS, and other apps
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </BlurView>
        </View>
      )}
    </SafeAreaView>
  );
}