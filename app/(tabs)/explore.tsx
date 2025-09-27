import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store/index';
import { WelcomeMessage } from '../../components/WelcomeMessage';
import { WanderLustCard } from '../../components/WanderLustCard';
import { TravelWisdom } from '../../components/TravelWisdom';
import Sidebar from '@/components/Sidebar';
import ItineraryForm from '@/components/ItineraryForm';
import ItineraryList from '@/components/ItineraryList';
import ItineraryDisplay from '@/components/ItineraryDisplay';

export default function ExploreScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { 
    user, 
    destinations, 
    adventureTip, 
    isWanderlustLoading,
    getTodaysWanderlust,
    getTodaysAdventureTip 
  } = useAppStore();
  const [selectedWanderlust, setSelectedWanderlust] = useState<any>(null);
  const [showWanderlustModal, setShowWanderlustModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('explore');
  const [showItineraryForm, setShowItineraryForm] = useState(false);
  const [showItineraryList, setShowItineraryList] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<any>(null);
  const [showItineraryDisplay, setShowItineraryDisplay] = useState(false);

  // Load wanderlust data on component mount
  useEffect(() => {
    const loadWanderlustData = async () => {
      try {
        await Promise.all([
          getTodaysWanderlust(),
          getTodaysAdventureTip()
        ]);
      } catch (error) {
        console.error('Error loading wanderlust data:', error);
      }
    };

    loadWanderlustData();
  }, []);

  // Use AI-generated destinations or fallback to empty array
  const travelInspiration = destinations || [];

  const handleDestinationPress = (destinationData: any) => {
    setSelectedWanderlust(destinationData);
    setShowWanderlustModal(true);
  };

  const handleSidebarNavigate = (screen: string) => {
    setCurrentScreen(screen);
    // Handle navigation to different screens based on selection
    switch (screen) {
      case 'ItineraryForm':
        setShowItineraryForm(true);
        break;
      case 'ItineraryList':
        setShowItineraryList(true);
        break;
      case 'explore':
        // Return to explore screen
        break;
      default:
        // For other screens (coming soon features), just set the currentScreen
        console.log('Navigate to:', screen);
    }
  };

  const renderScreenContent = () => {
    if (currentScreen === 'explore') {
      return (
        <>
          {/* Daily Travel Inspiration */}
          {isWanderlustLoading ? (
            <View style={{
              marginHorizontal: 20,
              marginBottom: 20,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={{
                color: colors.textSecondary,
                marginTop: 16,
                fontSize: 16,
                fontWeight: '500',
              }}>
                Loading today's wanderlust destinations...
              </Text>
            </View>
          ) : (
            <WanderLustCard
              destinations={travelInspiration}
              onDestinationPress={handleDestinationPress}
              title="Today's Wanderlust"
              subtitle="Discover your next dream destination"
            />
          )}

          {/* Travel Wisdom */}
          <TravelWisdom />
        </>
      );
    }
    
    // For other screens, show a placeholder
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}>
        <View style={{
          backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
        }}>
          <Ionicons name="construct" size={48} color="#10B981" />
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            marginTop: 16,
            textAlign: 'center',
          }}>
            Coming Soon!
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 20,
          }}>
            The {currentScreen.replace(/([A-Z])/g, ' $1').toLowerCase()} feature is being built.
            Stay tuned for amazing travel planning tools!
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentScreen('explore')}
            style={{
              backgroundColor: '#10B981',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              marginTop: 20,
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontWeight: '600',
            }}>
              Back to Explore
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
                onPress={() => setShowSidebar(true)}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Ionicons name="menu" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome Message */}
          <WelcomeMessage userName={user?.firstName} />
        </View>

        {/* Dynamic Content */}
        {renderScreenContent()}
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
      
      {/* Sidebar */}
      <Sidebar
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        onNavigate={handleSidebarNavigate}
      />

      {/* Itinerary Form */}
      <ItineraryForm
        visible={showItineraryForm}
        onClose={() => setShowItineraryForm(false)}
        onGenerated={(itinerary) => {
          setSelectedItinerary(itinerary);
          setShowItineraryDisplay(true);
        }}
      />

      {/* Itinerary List */}
      {showItineraryList && (
        <ItineraryList
          onClose={() => setShowItineraryList(false)}
          onSelectItinerary={(itinerary) => {
            setSelectedItinerary(itinerary);
            setShowItineraryList(false);
            setShowItineraryDisplay(true);
          }}
        />
      )}

      {/* Itinerary Display */}
      {showItineraryDisplay && selectedItinerary && (
        <ItineraryDisplay
          visible={showItineraryDisplay}
          itinerary={selectedItinerary}
          onClose={() => {
            setShowItineraryDisplay(false);
            setSelectedItinerary(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}
