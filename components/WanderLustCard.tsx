import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface WanderLustDestination {
  destination: string;
  type: string;
  emoji: string;
  description: string;
  highlights: string[];
  bestTime: string;
  activities: string[];
  article: string;
}

interface WanderLustCardProps {
  destinations: WanderLustDestination[];
  onDestinationPress: (destination: WanderLustDestination) => void;
  title?: string;
  subtitle?: string;
}

export const WanderLustCard: React.FC<WanderLustCardProps> = ({
  destinations,
  onDestinationPress,
  title = "Today's Wanderlust",
  subtitle = "Discover your next dream destination"
}) => {
  const { colors, isDarkMode } = useTheme();

  return (
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
            {title}
          </Text>
        </View>
        <Text style={{
          fontSize: 14,
          color: colors.textSecondary,
          fontWeight: '500',
          marginLeft: 16,
        }}>
          {subtitle}
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4 }}
      >
        {destinations.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onDestinationPress(item)}
            style={{
              width: 280,
              borderRadius: 16,
              overflow: 'hidden',
              marginRight: 16,
              backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
              elevation: 4,
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Compact Header */}
            <View style={{
              backgroundColor: '#10B981',
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 28, marginRight: 12 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '700',
                  marginBottom: 2,
                }}>
                  {item.destination}
                </Text>
                <Text style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 12,
                  fontWeight: '500',
                }}>
                  {item.type}
                </Text>
              </View>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                padding: 6,
              }}>
                <Ionicons name="chevron-forward" size={16} color="white" />
              </View>
            </View>

            {/* Compact Content */}
            <View style={{ padding: 12 }}>
              {/* Truncated Description */}
              <Text style={{
                fontSize: 13,
                color: colors.text,
                fontWeight: '500',
                marginBottom: 8,
                lineHeight: 18,
              }} numberOfLines={2}>
                {item.description}
              </Text>

              {/* Best Time Info */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Ionicons name="calendar-outline" size={12} color="#10B981" />
                <Text style={{
                  fontSize: 11,
                  color: '#10B981',
                  fontWeight: '600',
                  marginLeft: 4,
                }}>
                  {item.bestTime}
                </Text>
              </View>

              {/* Single Highlight */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Ionicons name="star" size={12} color="#FFA500" />
                <Text style={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  fontWeight: '500',
                  marginLeft: 4,
                  flex: 1,
                }} numberOfLines={1}>
                  {item.highlights[0]}
                </Text>
              </View>

              {/* Activities Badge */}
              <View style={{
                alignSelf: 'flex-start',
              }}>
                <View style={{
                  backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: '#10B981',
                    fontWeight: '700',
                  }}>
                    {item.activities.length}+ Activities
                  </Text>
                </View>
              </View>
            </View>

            {/* Tap to Explore Footer */}
            <View style={{
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)',
              paddingVertical: 8,
              paddingHorizontal: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{
                fontSize: 11,
                color: '#10B981',
                fontWeight: '600',
                marginRight: 4,
              }}>
                Tap to explore
              </Text>
              <Ionicons name="arrow-forward" size={12} color="#10B981" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};