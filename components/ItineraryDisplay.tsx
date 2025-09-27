import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Share,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../store';

const { width } = Dimensions.get('window');

interface Activity {
  time: string;
  activity: string;
  location: string;
  description: string;
  estimatedCost?: string;
  tips?: string;
}

interface DayPlan {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
}

interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: string;
  location: string;
  speciality: string;
}

interface Hotel {
  name: string;
  type: string;
  priceRange: string;
  location: string;
  amenities: string[];
}

interface Tip {
  category: string;
  tip: string;
}

interface Recommendations {
  restaurants: Restaurant[];
  hotels: Hotel[];
  tips: Tip[];
}

interface EstimatedBudget {
  total: string;
  breakdown: {
    accommodation: string;
    food: string;
    activities: string;
    transportation: string;
    miscellaneous: string;
  };
}

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  overview: string;
  highlights: string[];
  dailyPlan: DayPlan[];
  recommendations: Recommendations;
  estimatedBudget: EstimatedBudget;
  preferences?: any;
  rating?: number;
  notes?: string;
  createdAt: string;
}

interface ItineraryDisplayProps {
  visible: boolean;
  itinerary: Itinerary | null;
  onClose: () => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ visible, itinerary, onClose }) => {
  const { colors, isDarkMode } = useTheme();
  const { updateItineraryRating, updateItineraryNotes } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [userRating, setUserRating] = useState(0);

  if (!itinerary) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'information-circle' },
    { id: 'itinerary', label: 'Itinerary', icon: 'list' },
    { id: 'recommendations', label: 'Tips', icon: 'bulb' },
    { id: 'budget', label: 'Budget', icon: 'calculator' }
  ];

  const handleShare = async () => {
    try {
      const shareContent = `🌍 My ${itinerary.title}\n\n${itinerary.overview}\n\n📍 Destination: ${itinerary.destination}\n🗓️ Duration: ${itinerary.dailyPlan.length} days\n\n✨ Highlights:\n${itinerary.highlights.map(h => `• ${h}`).join('\n')}\n\nGenerated with WanderSphere ✈️`;
      
      await Share.share({
        message: shareContent,
        title: itinerary.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share itinerary');
    }
  };

  const handleRating = async (rating: number) => {
    setUserRating(rating);
    try {
      await updateItineraryRating(itinerary.id, rating);
    } catch (error) {
      Alert.alert('Error', 'Failed to update rating');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateItineraryNotes(itinerary.id, notes);
      setShowNotesModal(false);
      Alert.alert('Success', 'Notes saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
    }
  };

  const renderOverview = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={{
        backgroundColor: '#10B981',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        position: 'relative'
      }}>
        <Text style={{
          color: 'white',
          fontSize: 24,
          fontWeight: '800',
          marginBottom: 8,
          textAlign: 'center'
        }}>
          {itinerary.title}
        </Text>
        <Text style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 16,
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {itinerary.destination} • {itinerary.dailyPlan.length} Days
        </Text>
      </View>

      {/* Overview */}
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Ionicons name="document-text" size={24} color="#10B981" />
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginLeft: 12
          }}>
            Trip Overview
          </Text>
        </View>
        <Text style={{
          fontSize: 15,
          color: colors.text,
          lineHeight: 22,
          fontWeight: '500'
        }}>
          {itinerary.overview}
        </Text>
      </View>

      {/* Highlights */}
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Ionicons name="star" size={24} color="#F59E0B" />
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginLeft: 12
          }}>
            Trip Highlights
          </Text>
        </View>
        {itinerary.highlights.map((highlight, index) => (
          <View key={index} style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 12
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#F59E0B',
              marginTop: 6,
              marginRight: 12
            }} />
            <Text style={{
              fontSize: 15,
              color: colors.text,
              flex: 1,
              fontWeight: '500',
              lineHeight: 20
            }}>
              {highlight}
            </Text>
          </View>
        ))}
      </View>

      {/* Rating */}
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 16
        }}>
          Rate this itinerary
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleRating(star)}
              style={{ marginHorizontal: 4 }}
            >
              <Ionicons
                name={star <= (userRating || itinerary.rating || 0) ? 'star' : 'star-outline'}
                size={32}
                color={star <= (userRating || itinerary.rating || 0) ? '#F59E0B' : colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderItinerary = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {itinerary.dailyPlan.map((day, dayIndex) => (
        <View key={day.day} style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          {/* Day Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#10B981',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}>
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '700'
              }}>
                {day.day}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 2
              }}>
                {day.theme}
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                fontWeight: '500'
              }}>
                {new Date(day.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          {/* Activities */}
          {day.activities.map((activity, activityIndex) => (
            <View key={activityIndex} style={{
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#10B981'
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 8
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: '#10B981'
                }}>
                  {activity.time}
                </Text>
                {activity.estimatedCost && (
                  <Text style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    backgroundColor: colors.input,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                    fontWeight: '600'
                  }}>
                    {activity.estimatedCost}
                  </Text>
                )}
              </View>
              
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 4
              }}>
                {activity.activity}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  fontWeight: '600',
                  marginLeft: 4
                }}>
                  {activity.location}
                </Text>
              </View>
              
              <Text style={{
                fontSize: 14,
                color: colors.text,
                lineHeight: 20,
                marginBottom: 8,
                fontWeight: '500'
              }}>
                {activity.description}
              </Text>
              
              {activity.tips && (
                <View style={{
                  backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  borderRadius: 8,
                  padding: 12,
                  borderLeftWidth: 3,
                  borderLeftColor: '#3B82F6'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="bulb" size={16} color="#3B82F6" />
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: '#3B82F6',
                      marginLeft: 6
                    }}>
                      Pro Tip
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 13,
                    color: colors.text,
                    lineHeight: 18,
                    fontWeight: '500'
                  }}>
                    {activity.tips}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderRecommendations = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {/* Travel Tips */}
      {itinerary.recommendations.tips.length > 0 && (
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginLeft: 12
            }}>
              Travel Tips
            </Text>
          </View>
          {itinerary.recommendations.tips.map((tip, index) => (
            <View key={index} style={{
              backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#F59E0B'
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '700',
                color: '#F59E0B',
                marginBottom: 8
              }}>
                {tip.category}
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.text,
                lineHeight: 20,
                fontWeight: '500'
              }}>
                {tip.tip}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Restaurants */}
      {itinerary.recommendations.restaurants.length > 0 && (
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="restaurant" size={24} color="#EF4444" />
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginLeft: 12
            }}>
              Recommended Restaurants
            </Text>
          </View>
          {itinerary.recommendations.restaurants.map((restaurant, index) => (
            <View key={index} style={{
              backgroundColor: colors.input,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.text,
                  flex: 1
                }}>
                  {restaurant.name}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  backgroundColor: colors.background,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  fontWeight: '600'
                }}>
                  {restaurant.priceRange}
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                fontWeight: '600',
                marginBottom: 4
              }}>
                {restaurant.cuisine} • {restaurant.location}
              </Text>
              {restaurant.speciality && (
                <Text style={{
                  fontSize: 13,
                  color: colors.text,
                  fontStyle: 'italic',
                  fontWeight: '500'
                }}>
                  Try: {restaurant.speciality}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Hotels */}
      {itinerary.recommendations.hotels.length > 0 && (
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="bed" size={24} color="#8B5CF6" />
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginLeft: 12
            }}>
              Accommodation Options
            </Text>
          </View>
          {itinerary.recommendations.hotels.map((hotel, index) => (
            <View key={index} style={{
              backgroundColor: colors.input,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.text,
                  flex: 1
                }}>
                  {hotel.name}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  backgroundColor: colors.background,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  fontWeight: '600'
                }}>
                  {hotel.priceRange}
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                fontWeight: '600',
                marginBottom: 8
              }}>
                {hotel.type} • {hotel.location}
              </Text>
              {hotel.amenities.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {hotel.amenities.map((amenity, amenityIndex) => (
                    <View key={amenityIndex} style={{
                      backgroundColor: colors.background,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginRight: 8,
                      marginBottom: 4
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        fontWeight: '500'
                      }}>
                        {amenity}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderBudget = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {/* Total Budget */}
      <View style={{
        backgroundColor: '#10B981',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center'
      }}>
        <Text style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 8
        }}>
          Estimated Total Budget
        </Text>
        <Text style={{
          color: 'white',
          fontSize: 32,
          fontWeight: '800'
        }}>
          {itinerary.estimatedBudget.total}
        </Text>
        <Text style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 14,
          fontWeight: '500',
          marginTop: 4
        }}>
          For {itinerary.preferences?.groupSize || 1} {(itinerary.preferences?.groupSize || 1) === 1 ? 'person' : 'people'}
        </Text>
      </View>

      {/* Budget Breakdown */}
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Ionicons name="pie-chart" size={24} color="#3B82F6" />
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginLeft: 12
          }}>
            Budget Breakdown
          </Text>
        </View>

        {Object.entries(itinerary.estimatedBudget.breakdown).map(([category, amount], index) => {
          const icons = {
            accommodation: 'bed',
            food: 'restaurant',
            activities: 'compass',
            transportation: 'car',
            miscellaneous: 'ellipsis-horizontal'
          };
          
          const categoryColors = {
            accommodation: '#8B5CF6',
            food: '#EF4444',
            activities: '#F59E0B',
            transportation: '#3B82F6',
            miscellaneous: '#6B7280'
          };

          return (
            <View key={category} style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 12,
              borderBottomWidth: index < Object.entries(itinerary.estimatedBudget.breakdown).length - 1 ? 1 : 0,
              borderBottomColor: colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: `${categoryColors[category as keyof typeof categoryColors]}15`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Ionicons 
                    name={icons[category as keyof typeof icons] as any} 
                    size={18} 
                    color={categoryColors[category as keyof typeof categoryColors]} 
                  />
                </View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  textTransform: 'capitalize'
                }}>
                  {category}
                </Text>
              </View>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text
              }}>
                {amount}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Budget Tips */}
      <View style={{
        backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
        borderRadius: 16,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="bulb" size={20} color="#3B82F6" />
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#3B82F6',
            marginLeft: 8
          }}>
            Money-Saving Tips
          </Text>
        </View>
        <Text style={{
          fontSize: 14,
          color: colors.text,
          lineHeight: 20,
          fontWeight: '500'
        }}>
          • Book accommodations and flights in advance for better rates{'\n'}
          • Consider local transportation and street food for authentic experiences{'\n'}
          • Look for free walking tours and museum days{'\n'}
          • Travel during shoulder seasons for lower costs
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          backgroundColor: colors.background,
          paddingTop: 60,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.input,
                borderRadius: 12,
                padding: 10,
              }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: '700',
              flex: 1,
              textAlign: 'center',
              marginHorizontal: 16
            }} numberOfLines={1}>
              {itinerary.destination}
            </Text>

            <TouchableOpacity
              onPress={handleShare}
              style={{
                backgroundColor: colors.input,
                borderRadius: 12,
                padding: 10,
              }}
            >
              <Ionicons name="share" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
          >
            <View style={{ flexDirection: 'row' }}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 24,
                    backgroundColor: activeTab === tab.id ? '#10B981' : colors.input,
                    marginRight: 12,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <Ionicons 
                    name={tab.icon as any} 
                    size={18} 
                    color={activeTab === tab.id ? 'white' : colors.textSecondary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{
                    color: activeTab === tab.id ? 'white' : colors.textSecondary,
                    fontSize: 14,
                    fontWeight: '600'
                  }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Content */}
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'itinerary' && renderItinerary()}
          {activeTab === 'recommendations' && renderRecommendations()}
          {activeTab === 'budget' && renderBudget()}
        </View>
      </View>
    </Modal>
  );
};

export default ItineraryDisplay;