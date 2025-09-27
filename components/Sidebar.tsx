import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose, onNavigate }) => {
  const { colors, isDarkMode } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(-width)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const menuItems = [
    {
      id: 'generate-itinerary',
      title: 'Generate Itinerary Plan',
      subtitle: 'Create your perfect travel plan',
      icon: 'map',
      color: '#10B981',
      screen: 'ItineraryForm'
    },
    {
      id: 'my-itineraries',
      title: 'My Itineraries',
      subtitle: 'View your travel plans',
      icon: 'list',
      color: '#3B82F6',
      screen: 'ItineraryList'
    },
    {
      id: 'popular-destinations',
      title: 'Popular Destinations',
      subtitle: 'Trending travel spots',
      icon: 'trending-up',
      color: '#F59E0B',
      screen: 'PopularDestinations'
    },
    {
      id: 'travel-inspiration',
      title: 'Travel Inspiration',
      subtitle: 'Daily wanderlust & tips',
      icon: 'bulb',
      color: '#8B5CF6',
      screen: 'TravelInspiration'
    },
    {
      id: 'travel-budget',
      title: 'Budget Calculator',
      subtitle: 'Plan your travel expenses',
      icon: 'calculator',
      color: '#EF4444',
      screen: 'BudgetCalculator'
    }
  ];

  const handleItemPress = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Sidebar */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: width * 0.85,
            backgroundColor: colors.background,
            transform: [{ translateX: slideAnim }],
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
          }}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: '#10B981',
              paddingTop: 60,
              paddingBottom: 24,
              paddingHorizontal: 24,
            }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 8,
                  height: 32,
                  backgroundColor: 'white',
                  borderRadius: 4,
                  marginRight: 12,
                }} />
                <Text style={{
                  color: 'white',
                  fontSize: 24,
                  fontWeight: '800',
                  letterSpacing: -0.5,
                }}>
                  🌍 Explore
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 12,
                  padding: 8,
                }}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 14,
              fontWeight: '500',
              marginTop: 8,
              marginLeft: 20,
            }}>
              Your travel companion awaits
            </Text>
          </View>

          {/* Menu Items */}
          <View style={{ flex: 1, paddingTop: 16 }}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemPress(item.screen)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  marginHorizontal: 12,
                  marginBottom: 8,
                  borderRadius: 16,
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${item.color}15`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={item.color} 
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 2,
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    fontWeight: '500',
                  }}>
                    {item.subtitle}
                  </Text>
                </View>
                
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          }}>
            <View style={{
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: 12,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#10B981',
            }}>
              <Text style={{
                fontSize: 13,
                color: '#10B981',
                fontWeight: '700',
                marginBottom: 4,
              }}>
                ✨ Pro Tip
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.textSecondary,
                lineHeight: 16,
                fontWeight: '500',
              }}>
                Generate multiple itineraries to compare and find the perfect adventure for you!
              </Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default Sidebar;