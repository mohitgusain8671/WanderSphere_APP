import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { WelcomeMessage } from '../../components/WelcomeMessage';
import { WanderLustCard } from '../../components/WanderLustCard';
import { TravelWisdom } from '../../components/TravelWisdom';

export default function ExploreScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user } = useAppStore();
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

  const handleDestinationPress = (destinationData: any) => {
    setSelectedWanderlust(destinationData);
    setShowWanderlustModal(true);
  };

  const destinations = [
    { name: 'Paris, France', icon: '🗼', color: '#EF4444' },
    { name: 'Tokyo, Japan', icon: '🏯', color: '#F59E0B' },
    { name: 'New York, USA', icon: '🗽', color: '#3B82F6' },
    { name: 'London, UK', icon: '🏰', color: '#10B981' },
    { name: 'Sydney, Australia', icon: '🏖️', color: '#8B5CF6' },
    { name: 'Dubai, UAE', icon: '🏜️', color: '#F59E0B' },
  ];

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
                🌍 Explore World
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
                <Ionicons name="search" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome Message */}
          <WelcomeMessage userName={user?.firstName} />
        </View>

        {/* Daily Travel Inspiration */}
        <WanderLustCard
          destinations={travelInspiration}
          onDestinationPress={handleDestinationPress}
          title="Today's Wanderlust"
          subtitle="Discover your next dream destination"
        />

        {/* Travel Wisdom */}
        <TravelWisdom />

        <View style={{ paddingHorizontal: 20 }}>

        {/* Search Bar */}
        <View 
          className="flex-row items-center p-4 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text 
            className="ml-3 text-base"
            style={{ color: colors.textSecondary }}
          >
            Search destinations...
          </Text>
        </View>

        {/* Popular Destinations */}
        <View className="mb-6">
          <Text 
            className="text-xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Popular Destinations
          </Text>
          
          <View className="space-y-3">
            {destinations.map((destination, index) => (
              <TouchableOpacity 
                key={index}
                className="flex-row items-center p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${destination.color}20` }}
                >
                  <Text className="text-2xl">{destination.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-base font-semibold"
                    style={{ color: colors.text }}
                  >
                    {destination.name}
                  </Text>
                  <Text 
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Discover amazing places and experiences
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coming Soon */}
        <View 
          className="p-6 rounded-xl mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="items-center">
            <Ionicons name="map" size={48} color="#3B82F6" />
            <Text 
              className="text-lg font-bold mt-4 mb-2"
              style={{ color: colors.text }}
            >
              Interactive Map Coming Soon!
            </Text>
            <Text 
              className="text-sm text-center"
              style={{ color: colors.textSecondary }}
            >
              Explore destinations on an interactive map with reviews, photos, and travel tips.
            </Text>
          </View>
        </View>

        <View className="h-8" />
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
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="compass" size={20} color="#10B981" />
                    <Text style={{
                      fontSize: 16,
                      color: colors.text,
                      fontWeight: '700',
                      marginLeft: 8,
                    }}>
                      Popular Activities
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {selectedWanderlust.activities.map((activity: string, index: number) => (
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
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}