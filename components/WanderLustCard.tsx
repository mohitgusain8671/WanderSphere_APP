import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {destinations.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onDestinationPress(item)}
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
  );
};