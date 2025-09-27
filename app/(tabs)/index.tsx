import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfiniteScrollView } from '../../components/InfiniteScrollView';
import { StoriesBar } from '../../components/StoriesBar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { storyGroups, getStories, getUnreadCount, user } = useAppStore();
  const [refreshingStories, setRefreshingStories] = useState(false);
  const [selectedWanderlust, setSelectedWanderlust] = useState<any>(null);
  const [showWanderlustModal, setShowWanderlustModal] = useState(false);

  // Comprehensive wanderlust destinations with full articles
  const allWanderlustDestinations = [
    {
      destination: 'Bali, Indonesia',
      type: 'Tropical Paradise',
      emoji: '🏝️',
      description: 'Discover the magical island where ancient temples meet pristine beaches',
      highlights: ['Sacred Monkey Forest', 'Tegallalang Rice Terraces', 'Sunset at Tanah Lot'],
      bestTime: 'April - October',
      activities: ['Temple hopping', 'Surfing', 'Yoga retreats', 'Traditional cooking classes'],
      article: 'Bali enchants visitors with its perfect blend of spiritual culture and natural beauty. From the iconic rice terraces of Jatiluwih to the mystical temples of Uluwatu, every corner tells a story of harmony between humans and nature.'
    },
    {
      destination: 'Swiss Alps, Switzerland',
      type: 'Mountain Adventure',
      emoji: '⛰️',
      description: 'Experience breathtaking peaks, crystal-clear lakes, and charming alpine villages',
      highlights: ['Matterhorn Peak', 'Jungfraujoch', 'Lake Geneva'],
      bestTime: 'June - September',
      activities: ['Hiking', 'Skiing', 'Mountain railways', 'Alpine photography'],
      article: 'The Swiss Alps offer some of the world\'s most spectacular mountain scenery. Whether you\'re riding the scenic train routes or hiking through flower-filled meadows, the majestic peaks create unforgettable memories.'
    },
    {
      destination: 'Kyoto, Japan',
      type: 'Cultural Heritage',
      emoji: '🏯',
      description: 'Step into ancient Japan with traditional temples, gardens, and geisha districts',
      highlights: ['Fushimi Inari Shrine', 'Bamboo Grove', 'Gion District'],
      bestTime: 'March - May, September - November',
      activities: ['Temple visits', 'Tea ceremonies', 'Cherry blossom viewing', 'Traditional crafts'],
      article: 'Kyoto preserves Japan\'s cultural soul through its 2,000 temples and shrines. Walk through the famous torii gates of Fushimi Inari or experience the tranquility of zen gardens in this former imperial capital.'
    },
    {
      destination: 'Santorini, Greece',
      type: 'Romantic Escape',
      emoji: '🌅',
      description: 'Witness the world\'s most famous sunsets from clifftop villages overlooking the Aegean',
      highlights: ['Oia Sunset', 'Blue Domed Churches', 'Red Beach'],
      bestTime: 'April - October',
      activities: ['Sunset watching', 'Wine tasting', 'Volcanic tours', 'Beach hopping'],
      article: 'Santorini\'s dramatic cliffs and whitewashed buildings create a dreamlike setting. The island\'s volcanic history shaped its unique landscape, while its sunsets paint the sky in impossible shades of orange and pink.'
    },
    {
      destination: 'Machu Picchu, Peru',
      type: 'Ancient Wonder',
      emoji: '🏛️',
      description: 'Explore the mysterious lost city of the Incas high in the Andes Mountains',
      highlights: ['Huayna Picchu', 'Temple of the Sun', 'Inca Trail'],
      bestTime: 'May - September',
      activities: ['Archaeological exploration', 'Inca Trail hiking', 'Llama spotting', 'Sunrise viewing'],
      article: 'Machu Picchu stands as one of humanity\'s greatest achievements, a testament to Inca engineering and astronomy. This sacred citadel, shrouded in morning mist, reveals its secrets to those who make the pilgrimage.'
    },
    {
      destination: 'Northern Lights, Iceland',
      type: 'Natural Phenomenon',
      emoji: '🌌',
      description: 'Chase the magical aurora borealis across Iceland\'s dramatic landscapes',
      highlights: ['Aurora viewing', 'Blue Lagoon', 'Golden Circle'],
      bestTime: 'September - March',
      activities: ['Northern lights tours', 'Ice cave exploration', 'Hot spring bathing', 'Glacier hiking'],
      article: 'Iceland offers front-row seats to nature\'s most spectacular light show. The aurora borealis dances across star-filled skies while geysers, waterfalls, and glaciers create an otherworldly backdrop.'
    },
    {
      destination: 'Safari in Kenya',
      type: 'Wildlife Adventure',
      emoji: '🦁',
      description: 'Witness the great migration and Africa\'s incredible wildlife in their natural habitat',
      highlights: ['Masai Mara', 'Great Migration', 'Amboseli National Park'],
      bestTime: 'July - October',
      activities: ['Game drives', 'Cultural visits', 'Hot air balloon safaris', 'Photography'],
      article: 'Kenya\'s savannas come alive with the drama of the wild. From lions stalking through golden grass to elephants roaming beneath Kilimanjaro, every moment offers a glimpse into nature\'s raw beauty.'
    },
    {
      destination: 'Patagonia, Argentina & Chile',
      type: 'Wilderness Expedition',
      emoji: '🏔️',
      description: 'Venture into one of Earth\'s last great wildernesses at the end of the world',
      highlights: ['Torres del Paine', 'Perito Moreno Glacier', 'Ushuaia'],
      bestTime: 'November - March',
      activities: ['Trekking', 'Glacier viewing', 'Wildlife watching', 'Kayaking'],
      article: 'Patagonia\'s vast landscapes challenge and inspire adventurous souls. Where jagged peaks pierce dramatic skies and ancient glaciers carve through granite, nature reveals its most untamed beauty.'
    },
    {
      destination: 'Maldives',
      type: 'Tropical Paradise',
      emoji: '🏖️',
      description: 'Escape to pristine coral atolls surrounded by crystal-clear turquoise waters',
      highlights: ['Overwater bungalows', 'Coral reefs', 'Bioluminescent beaches'],
      bestTime: 'November - April',
      activities: ['Snorkeling', 'Diving', 'Spa treatments', 'Sunset cruises'],
      article: 'The Maldives redefines paradise with its chain of coral islands scattered across the Indian Ocean. Each resort occupies its own island, offering unparalleled privacy and direct access to pristine reefs.'
    }
  ];

  // Get today's wanderlust destinations (3 destinations that change daily)
  const getTodaysWanderlust = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const startIndex = (dayOfYear * 3) % allWanderlustDestinations.length;
    
    const todaysDestinations = [];
    for (let i = 0; i < 3; i++) {
      const index = (startIndex + i) % allWanderlustDestinations.length;
      todaysDestinations.push(allWanderlustDestinations[index]);
    }
    return todaysDestinations;
  };

  const travelInspiration = getTodaysWanderlust();

  const adventureTips = [
    { tip: "🎒 Pack light, travel far", author: "Every seasoned traveler" },
    { tip: "📸 Capture moments, not just photos", author: "The mindful explorer" },
    { tip: "🗺️ Get lost to find yourself", author: "Ancient travel wisdom" },
    { tip: "🌅 Early bird catches the sunrise", author: "Nature's photographer" },
    { tip: "🌍 The world is a book, read every page", author: "Saint Augustine" },
    { tip: "✈️ Adventure is worthwhile in itself", author: "Amelia Earhart" },
    { tip: "🏔️ Mountains know secrets we need to learn", author: "The wise wanderer" },
    { tip: "🌊 Let the waves wash your worries away", author: "Coastal philosophy" },
    { tip: "🚂 The journey matters more than the destination", author: "Ralph Waldo Emerson" },
    { tip: "🎯 Travel makes one modest, you see what a tiny place you occupy", author: "Gustave Flaubert" },
  ];

  useEffect(() => {
    // Load stories and notifications count on mount
    loadStories();
    getUnreadCount();
  }, []);

  const loadStories = async () => {
    setRefreshingStories(true);
    await getStories();
    setRefreshingStories(false);
  };

  const handleStoryPress = (storyGroup: any) => {
    // TODO: Navigate to story viewer
    console.log('View stories for:', storyGroup.author.firstName);
  };

  const handleAddStoryPress = () => {
    router.push('/(tabs)/add-story');
  };

  const handleAddPostPress = () => {
    router.push('/(tabs)/add-post');
  };

  const handlePostPress = (post: any) => {
    // TODO: Navigate to post detail screen
    console.log('View post:', post._id);
  };

  const handleCommentPress = (post: any) => {
    // TODO: Navigate to comments screen
    console.log('View comments for post:', post._id);
    Alert.alert('Comments', `Viewing comments for ${post.author.firstName}'s post`);
  };

  const handleUserPress = (userId: string) => {
    // TODO: Navigate to user profile
    console.log('View user profile:', userId);
  };

  const handleDestinationPress = (destinationData: any) => {
    setSelectedWanderlust(destinationData);
    setShowWanderlustModal(true);
  };

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Adventure Header */}
        <View 
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 6,
                height: 28,
                backgroundColor: '#10B981',
                borderRadius: 3,
                marginRight: 12,
              }} />
              <Text 
                style={{
                  fontSize: 24,
                  fontWeight: '800',
                  color: colors.text,
                  letterSpacing: -0.5,
                }}
              >
                🌍 WanderLands
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity 
                onPress={toggleTheme}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Ionicons 
                  name={isDarkMode ? 'sunny' : 'moon'} 
                  size={20} 
                  color={colors.text}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome Message */}
          <View style={{
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 4,
            marginTop: 8,
            borderLeftWidth: 3,
            borderLeftColor: '#10B981',
          }}>
            <Text style={{
              fontSize: 16,
              color: colors.text,
              fontWeight: '600',
              lineHeight: 22,
            }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.firstName || 'Explorer'}!
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              fontWeight: '500',
              marginTop: 4,
            }}>
              Ready for your next adventure? ✈️
            </Text>
          </View>
        </View>

        {/* Daily Travel Inspiration */}
        <View style={{ paddingVertical: 20 }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{
                width: 4,
                height: 20,
                backgroundColor: '#10B981',
                borderRadius: 2,
                marginRight: 12,
              }} />
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
              }}>
                Today's Wanderlust
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              fontWeight: '500',
              marginLeft: 16,
            }}>
              Discover your next dream destination
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {travelInspiration.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDestinationPress(item)}
                style={{
                  width: 300,
                  borderRadius: 20,
                  overflow: 'hidden',
                  marginRight: 20,
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                  elevation: 6,
                  shadowColor: '#10B981',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Header with emoji and destination */}
                <View style={{
                  backgroundColor: '#10B981',
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: '700',
                      marginBottom: 4,
                    }}>
                      {item.destination}
                    </Text>
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: 13,
                      fontWeight: '500',
                    }}>
                      {item.type}
                    </Text>
                  </View>
                </View>

                {/* Content */}
                <View style={{ padding: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    color: colors.text,
                    fontWeight: '600',
                    marginBottom: 12,
                    lineHeight: 20,
                  }}>
                    {item.description}
                  </Text>

                  {/* Best time to visit */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                    <Ionicons name="calendar-outline" size={14} color="#10B981" />
                    <Text style={{
                      fontSize: 12,
                      color: '#10B981',
                      fontWeight: '600',
                      marginLeft: 6,
                    }}>
                      Best time: {item.bestTime}
                    </Text>
                  </View>

                  {/* Top highlights */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons name="star-outline" size={14} color="#10B981" />
                    <Text style={{
                      fontSize: 12,
                      color: colors.text,
                      fontWeight: '500',
                      marginLeft: 6,
                      flex: 1,
                    }}>
                      Must see: {item.highlights.slice(0, 2).join(', ')}
                    </Text>
                  </View>

                  {/* Activities preview */}
                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 6,
                  }}>
                    {item.activities.slice(0, 3).map((activity, idx) => (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{
                          fontSize: 11,
                          color: '#10B981',
                          fontWeight: '500',
                        }}>
                          {activity}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Travel Wisdom */}
        <View style={{ 
          marginHorizontal: 20,
          marginBottom: 20,
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: 16,
          padding: 20,
        }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 12,
          }}>
            <Ionicons name="bulb-outline" size={20} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
            }}>
              Travel Wisdom
            </Text>
          </View>
          
          {(() => {
            const randomTip = adventureTips[Math.floor(Math.random() * adventureTips.length)];
            return (
              <View>
                <Text style={{
                  fontSize: 15,
                  color: colors.text,
                  fontWeight: '500',
                  lineHeight: 22,
                  marginBottom: 8,
                  fontStyle: 'italic',
                }}>
                  "{randomTip.tip}"
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  fontWeight: '500',
                  textAlign: 'right',
                }}>
                  — {randomTip.author}
                </Text>
              </View>
            );
          })()
          }
        </View>

        {/* Stories Section */}
        {!refreshingStories && storyGroups.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
              }}>
                📸 Adventure Stories
              </Text>
            </View>
            <StoriesBar
              storyGroups={storyGroups}
              onStoryPress={handleStoryPress}
              onAddStoryPress={handleAddStoryPress}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          marginBottom: 20,
          gap: 12,
        }}>
          <TouchableOpacity
            onPress={handleAddPostPress}
            style={{
              flex: 1,
              backgroundColor: '#10B981',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 3,
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="add-circle" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontWeight: '600',
            }}>
              Share Adventure
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/explore')}
            style={{
              flex: 1,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
            }}
          >
            <Ionicons name="compass" size={20} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={{
              color: '#10B981',
              fontSize: 14,
              fontWeight: '600',
            }}>
              Explore More
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Feed */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
          }}>
            🌟 Travel Feed
          </Text>
        </View>
        
        <View style={{ flex: 1, minHeight: 400 }}>
          <InfiniteScrollView
            onPostPress={handlePostPress}
            onCommentPress={handleCommentPress}
            onUserPress={handleUserPress}
          />
        </View>
      </ScrollView>

      {/* Wanderlust Detail Modal */}
      {showWanderlustModal && selectedWanderlust && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setShowWanderlustModal(false)}
          />
          
          <View style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderRadius: 24,
            margin: 20,
            maxHeight: '80%',
            width: '90%',
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={{
                backgroundColor: '#10B981',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 32, marginRight: 16 }}>{selectedWanderlust.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: 'white',
                      fontSize: 22,
                      fontWeight: '800',
                      marginBottom: 4,
                    }}>
                      {selectedWanderlust.destination}
                    </Text>
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: 14,
                      fontWeight: '600',
                    }}>
                      {selectedWanderlust.type}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowWanderlustModal(false)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 12,
                    padding: 8,
                  }}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={{ padding: 24 }}>
                {/* Description */}
                <Text style={{
                  fontSize: 16,
                  color: colors.text,
                  fontWeight: '600',
                  marginBottom: 16,
                  lineHeight: 24,
                }}>
                  {selectedWanderlust.description}
                </Text>

                {/* Article */}
                <Text style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  lineHeight: 22,
                  marginBottom: 24,
                }}>
                  {selectedWanderlust.article}
                </Text>

                {/* Best Time */}
                <View style={{
                  backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: '#10B981',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="calendar" size={20} color="#10B981" />
                    <Text style={{
                      fontSize: 16,
                      color: colors.text,
                      fontWeight: '700',
                      marginLeft: 8,
                    }}>
                      Best Time to Visit
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 15,
                    color: '#10B981',
                    fontWeight: '600',
                  }}>
                    {selectedWanderlust.bestTime}
                  </Text>
                </View>

                {/* Highlights */}
                <View style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="star" size={20} color="#10B981" />
                    <Text style={{
                      fontSize: 16,
                      color: colors.text,
                      fontWeight: '700',
                      marginLeft: 8,
                    }}>
                      Must-See Highlights
                    </Text>
                  </View>
                  {selectedWanderlust.highlights.map((highlight: string, index: number) => (
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}>
                      <View style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#10B981',
                        marginRight: 12,
                      }} />
                      <Text style={{
                        fontSize: 14,
                        color: colors.text,
                        fontWeight: '500',
                      }}>
                        {highlight}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Activities */}
                <View style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="trail-sign" size={20} color="#10B981" />
                    <Text style={{
                      fontSize: 16,
                      color: colors.text,
                      fontWeight: '700',
                      marginLeft: 8,
                    }}>
                      Popular Activities
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}>
                    {selectedWanderlust.activities.map((activity: string, index: number) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                        }}
                      >
                        <Text style={{
                          fontSize: 13,
                          color: '#10B981',
                          fontWeight: '600',
                        }}>
                          {activity}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  onPress={() => {
                    setShowWanderlustModal(false);
                    // TODO: Navigate to explore this destination
                    Alert.alert('Explore', `Let's plan your trip to ${selectedWanderlust.destination}!`);
                  }}
                  style={{
                    backgroundColor: '#10B981',
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 8,
                  }}
                >
                  <Ionicons name="airplane" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                    Plan Your Journey
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
