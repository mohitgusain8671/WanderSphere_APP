import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../store';

const { width, height } = Dimensions.get('window');

interface ItineraryFormProps {
  visible: boolean;
  onClose: () => void;
  onGenerated?: (itinerary: any) => void;
}

const ItineraryForm: React.FC<ItineraryFormProps> = ({ visible, onClose, onGenerated }) => {
  const { colors, isDarkMode } = useTheme();
  const { generateItinerary, isGenerating } = useAppStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    destination: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    budget: '',
    travelStyle: '',
    interests: [] as string[],
    accommodation: '',
    transportation: '',
    groupSize: 1,
    specialRequirements: ''
  });

  const steps = [
    { title: 'Destination', subtitle: 'Where do you want to go?' },
    { title: 'Dates', subtitle: 'When are you traveling?' },
    { title: 'Budget & Style', subtitle: 'What\'s your travel preference?' },
    { title: 'Interests', subtitle: 'What do you enjoy?' },
    { title: 'Logistics', subtitle: 'Travel details' },
    { title: 'Final Details', subtitle: 'Any special requirements?' }
  ];

  const budgetOptions = [
    { value: 'budget', label: 'Budget', subtitle: 'Under $100/day', icon: 'wallet', color: '#10B981' },
    { value: 'mid-range', label: 'Mid-Range', subtitle: '$100-300/day', icon: 'card', color: '#F59E0B' },
    { value: 'luxury', label: 'Luxury', subtitle: '$300+/day', icon: 'diamond', color: '#8B5CF6' }
  ];

  const travelStyleOptions = [
    { value: 'adventure', label: 'Adventure', icon: 'mountain', color: '#EF4444' },
    { value: 'relaxation', label: 'Relaxation', icon: 'leaf', color: '#10B981' },
    { value: 'cultural', label: 'Cultural', icon: 'library', color: '#8B5CF6' },
    { value: 'family', label: 'Family', icon: 'people', color: '#F59E0B' },
    { value: 'romantic', label: 'Romantic', icon: 'heart', color: '#EF4444' },
    { value: 'business', label: 'Business', icon: 'briefcase', color: '#6B7280' },
    { value: 'backpacking', label: 'Backpacking', icon: 'backpack', color: '#10B981' }
  ];

  const interestOptions = [
    'Museums & Art', 'Food & Dining', 'Nature & Outdoors', 'History & Architecture',
    'Shopping', 'Nightlife & Entertainment', 'Photography', 'Local Culture',
    'Sports & Activities', 'Beaches & Water Sports', 'Mountains & Hiking', 'Wildlife'
  ];

  const accommodationOptions = [
    { value: 'hotel', label: 'Hotel', icon: 'business' },
    { value: 'hostel', label: 'Hostel', icon: 'bed' },
    { value: 'airbnb', label: 'Airbnb', icon: 'home' },
    { value: 'resort', label: 'Resort', icon: 'flower' },
    { value: 'guesthouse', label: 'Guesthouse', icon: 'people' }
  ];

  const transportationOptions = [
    { value: 'flight', label: 'Flight', icon: 'airplane' },
    { value: 'train', label: 'Train', icon: 'train' },
    { value: 'bus', label: 'Bus', icon: 'bus' },
    { value: 'car', label: 'Car', icon: 'car' },
    { value: 'mixed', label: 'Mixed', icon: 'shuffle' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInterestToggle = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: newInterests });
  };

  const handleGenerate = async () => {
    try {
      const result = await generateItinerary({
        ...formData,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0]
      });

      if (result.success) {
        Alert.alert(
          '🎉 Success!',
          'Your personalized itinerary has been generated!',
          [
            {
              text: 'View Itinerary',
              onPress: () => {
                onGenerated?.(result.data);
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to generate itinerary');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.destination.trim().length > 0;
      case 1: return formData.startDate && formData.endDate;
      case 2: return formData.budget && formData.travelStyle;
      case 3: return formData.interests.length > 0;
      case 4: return formData.accommodation && formData.transportation;
      case 5: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderLeftWidth: 4,
              borderLeftColor: '#10B981'
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#10B981',
                marginBottom: 8
              }}>
                🌍 Let's Plan Your Adventure
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                lineHeight: 20
              }}>
                Tell us where you'd like to go and we'll create a personalized itinerary just for you!
              </Text>
            </View>

            <TextInput
              style={{
                backgroundColor: colors.input,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: formData.destination ? '#10B981' : colors.border
              }}
              placeholder="Enter your dream destination..."
              placeholderTextColor={colors.textSecondary}
              value={formData.destination}
              onChangeText={(text) => setFormData({ ...formData, destination: text })}
              autoFocus
            />
          </View>
        );

      case 1:
        return (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              📅 When are you traveling to {formData.destination}?
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                Start Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                style={{
                  backgroundColor: colors.input,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Text style={{ color: colors.text, fontSize: 16 }}>
                  {formData.startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                End Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                style={{
                  backgroundColor: colors.input,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Text style={{ color: colors.text, fontSize: 16 }}>
                  {formData.endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: 12,
              padding: 16,
              marginTop: 20
            }}>
              <Text style={{
                color: '#10B981',
                fontSize: 14,
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Duration: {Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </Text>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={formData.startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) {
                    setFormData({ ...formData, startDate: selectedDate });
                  }
                }}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={formData.endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(false);
                  if (selectedDate) {
                    setFormData({ ...formData, endDate: selectedDate });
                  }
                }}
              />
            )}
          </View>
        );

      case 2:
        return (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 8,
              textAlign: 'center'
            }}>
              💰 What's your budget range?
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              This helps us suggest appropriate activities and accommodations
            </Text>

            {budgetOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setFormData({ ...formData, budget: option.value })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: formData.budget === option.value 
                    ? `${option.color}15` 
                    : colors.input,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: formData.budget === option.value ? option.color : colors.border
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${option.color}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16
                }}>
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 2
                  }}>
                    {option.label}
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: colors.textSecondary
                  }}>
                    {option.subtitle}
                  </Text>
                </View>
                {formData.budget === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color={option.color} />
                )}
              </TouchableOpacity>
            ))}

            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginTop: 32,
              marginBottom: 8,
              textAlign: 'center'
            }}>
              🎯 What's your travel style?
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              Choose the style that best describes your ideal trip
            </Text>

            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              {travelStyleOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setFormData({ ...formData, travelStyle: option.value })}
                  style={{
                    width: '48%',
                    alignItems: 'center',
                    backgroundColor: formData.travelStyle === option.value 
                      ? `${option.color}15` 
                      : colors.input,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: formData.travelStyle === option.value ? option.color : colors.border
                  }}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={32} 
                    color={formData.travelStyle === option.value ? option.color : colors.textSecondary} 
                  />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: formData.travelStyle === option.value ? option.color : colors.text,
                    marginTop: 8,
                    textAlign: 'center'
                  }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        );

      case 3:
        return (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 8,
              textAlign: 'center'
            }}>
              🎨 What interests you most?
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              Select all that apply - we'll tailor your itinerary accordingly
            </Text>

            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              {interestOptions.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  onPress={() => handleInterestToggle(interest)}
                  style={{
                    width: '48%',
                    backgroundColor: formData.interests.includes(interest)
                      ? 'rgba(16, 185, 129, 0.15)'
                      : colors.input,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: formData.interests.includes(interest) ? '#10B981' : colors.border,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: formData.interests.includes(interest) ? '#10B981' : colors.text,
                    textAlign: 'center'
                  }}>
                    {interest}
                  </Text>
                  {formData.interests.includes(interest) && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={20} 
                      color="#10B981" 
                      style={{ marginTop: 4 }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={{
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: 12,
              padding: 16,
              marginTop: 20
            }}>
              <Text style={{
                color: '#10B981',
                fontSize: 14,
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {formData.interests.length} interests selected
              </Text>
            </View>
          </ScrollView>
        );

      case 4:
        return (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              🏨 Accommodation & Transportation
            </Text>

            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 16
            }}>
              Where would you like to stay?
            </Text>

            {accommodationOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setFormData({ ...formData, accommodation: option.value })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: formData.accommodation === option.value 
                    ? 'rgba(16, 185, 129, 0.15)' 
                    : colors.input,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: formData.accommodation === option.value ? '#10B981' : colors.border
                }}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={formData.accommodation === option.value ? '#10B981' : colors.textSecondary}
                  style={{ marginRight: 16 }}
                />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: formData.accommodation === option.value ? '#10B981' : colors.text,
                  flex: 1
                }}>
                  {option.label}
                </Text>
                {formData.accommodation === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}

            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginTop: 32,
              marginBottom: 16
            }}>
              How do you prefer to travel?
            </Text>

            {transportationOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setFormData({ ...formData, transportation: option.value })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: formData.transportation === option.value 
                    ? 'rgba(16, 185, 129, 0.15)' 
                    : colors.input,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: formData.transportation === option.value ? '#10B981' : colors.border
                }}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={formData.transportation === option.value ? '#10B981' : colors.textSecondary}
                  style={{ marginRight: 16 }}
                />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: formData.transportation === option.value ? '#10B981' : colors.text,
                  flex: 1
                }}>
                  {option.label}
                </Text>
                {formData.transportation === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}

            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginTop: 32,
              marginBottom: 16
            }}>
              Group Size
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, groupSize: Math.max(1, formData.groupSize - 1) })}
                style={{
                  backgroundColor: colors.input,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>

              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text,
                marginHorizontal: 32,
                textAlign: 'center',
                minWidth: 40
              }}>
                {formData.groupSize}
              </Text>

              <TouchableOpacity
                onPress={() => setFormData({ ...formData, groupSize: Math.min(20, formData.groupSize + 1) })}
                style={{
                  backgroundColor: colors.input,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: 8
            }}>
              {formData.groupSize === 1 ? 'Solo traveler' : `${formData.groupSize} people`}
            </Text>
          </ScrollView>
        );

      case 5:
        return (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              ✨ Final Details
            </Text>

            <View style={{
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderLeftWidth: 4,
              borderLeftColor: '#10B981'
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#10B981',
                marginBottom: 12
              }}>
                📋 Your Trip Summary
              </Text>
              <Text style={{ color: colors.text, fontSize: 14, marginBottom: 4 }}>
                <Text style={{ fontWeight: '600' }}>Destination:</Text> {formData.destination}
              </Text>
              <Text style={{ color: colors.text, fontSize: 14, marginBottom: 4 }}>
                <Text style={{ fontWeight: '600' }}>Duration:</Text> {Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </Text>
              <Text style={{ color: colors.text, fontSize: 14, marginBottom: 4 }}>
                <Text style={{ fontWeight: '600' }}>Budget:</Text> {budgetOptions.find(b => b.value === formData.budget)?.label}
              </Text>
              <Text style={{ color: colors.text, fontSize: 14, marginBottom: 4 }}>
                <Text style={{ fontWeight: '600' }}>Style:</Text> {travelStyleOptions.find(t => t.value === formData.travelStyle)?.label}
              </Text>
              <Text style={{ color: colors.text, fontSize: 14 }}>
                <Text style={{ fontWeight: '600' }}>Group Size:</Text> {formData.groupSize} {formData.groupSize === 1 ? 'person' : 'people'}
              </Text>
            </View>

            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12
            }}>
              Any special requirements or preferences?
            </Text>

            <TextInput
              style={{
                backgroundColor: colors.input,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 100,
                textAlignVertical: 'top'
              }}
              placeholder="e.g., dietary restrictions, accessibility needs, must-see attractions, specific activities..."
              placeholderTextColor={colors.textSecondary}
              value={formData.specialRequirements}
              onChangeText={(text) => setFormData({ ...formData, specialRequirements: text })}
              multiline
              numberOfLines={4}
            />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <KeyboardAvoidingView 
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={{
          backgroundColor: '#10B981',
          paddingTop: 60,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <Text style={{
              color: 'white',
              fontSize: 20,
              fontWeight: '800',
            }}>
              Generate Itinerary
            </Text>

            <View style={{ width: 40 }} />
          </View>

          {/* Progress Bar */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 8,
            height: 8,
            marginBottom: 12
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 8,
              height: 8,
              width: `${((currentStep + 1) / steps.length) * 100}%`
            }} />
          </View>

          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 4
          }}>
            {steps[currentStep].title}
          </Text>
          <Text style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 14,
            fontWeight: '500'
          }}>
            {steps[currentStep].subtitle}
          </Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
          {renderStep()}
        </View>

        {/* Footer */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 20,
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={handleBack}
              disabled={currentStep === 0}
              style={{
                flex: 1,
                backgroundColor: currentStep === 0 ? colors.input : 'transparent',
                borderRadius: 12,
                padding: 16,
                marginRight: 10,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: currentStep === 0 ? 0.5 : 1
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '600',
                color: colors.text
              }}>
                Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={currentStep === steps.length - 1 ? handleGenerate : handleNext}
              disabled={!canProceed() || isGenerating}
              style={{
                flex: 1,
                backgroundColor: canProceed() ? '#10B981' : colors.input,
                borderRadius: 12,
                padding: 16,
                marginLeft: 10,
                opacity: canProceed() && !isGenerating ? 1 : 0.5
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '600',
                color: canProceed() ? 'white' : colors.textSecondary
              }}>
                {isGenerating ? 'Generating...' : currentStep === steps.length - 1 ? '🎯 Generate Itinerary' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{
            textAlign: 'center',
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 12
          }}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ItineraryForm;