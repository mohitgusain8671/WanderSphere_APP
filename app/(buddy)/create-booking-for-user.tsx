import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const SERVICES = [
  'Tour Guide', 'Transportation', 'Accommodation Help', 'Language Translation',
  'Photography', 'Food Guide', 'Adventure Activities', 'Cultural Experience',
  'Shopping Assistant', 'Event Planning', 'Airport Pickup', 'Custom Services',
];

export default function CreateBookingForUserScreen() {
  const { colors } = useTheme();
  const { createBookingByBuddy, isBuddyLoading, myBuddyProfile } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const [serviceType, setServiceType] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [durationType, setDurationType] = useState<'hours' | 'days'>('hours');
  const [durationValue, setDurationValue] = useState('');
  const [message, setMessage] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Use the friends search API to find users
      const response = await fetch(
        `${require('../../utils/constants').API_BASE_URL}/friends/search?query=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${await require('expo-secure-store').getItemAsync('access_token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data.users || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  const calculateAmount = () => {
    if (!myBuddyProfile) return;
    
    // If duration is empty or invalid, reset amount to 0
    if (!durationValue || durationValue.trim() === '') {
      setTotalAmount('0');
      return;
    }

    const duration = parseFloat(durationValue);
    if (isNaN(duration) || duration <= 0) {
      setTotalAmount('0');
      return;
    }

    const pricing = myBuddyProfile.pricing;
    let amount = 0;

    if (durationType === 'hours' && pricing.hourlyRate) {
      amount = pricing.hourlyRate * duration;
    } else if (durationType === 'days' && pricing.perDayCharge) {
      amount = pricing.perDayCharge * duration;
    }

    setTotalAmount(amount.toString());
  };

  React.useEffect(() => {
    calculateAmount();
  }, [durationType, durationValue]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSubmit = async () => {
    if (!selectedUser) {
      Alert.alert('Error', 'Please select a user');
      return;
    }
    if (!serviceType || !location || !durationValue || !totalAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const bookingData = {
      userId: selectedUser._id,
      serviceType,
      location: {
        city: location,
        country: 'India',
      },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: {
        [durationType]: parseFloat(durationValue),
      },
      totalAmount: parseFloat(totalAmount),
      message,
    };

    const result = await createBookingByBuddy(bookingData);
    
    if (result.success) {
      Alert.alert(
        'Success',
        'Booking created successfully! The user will be notified.',
        [{ text: 'OK', onPress: () => router.push('/(buddy)/buddy-booking-history' as any) }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to create booking');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Create Booking
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* User Selection */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Select User *
          </Text>
          
          {selectedUser ? (
            <View style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  {selectedUser.email}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
              }}>
                <Ionicons name="search" size={20} color={colors.textSecondary} />
                <TextInput
                  style={{
                    flex: 1,
                    padding: 14,
                    color: colors.text,
                    fontSize: 15,
                  }}
                  placeholder="Search by name or email..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searching && <ActivityIndicator size="small" color={colors.textSecondary} />}
              </View>
              
              {searchResults.length > 0 && (
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  marginTop: 8,
                  maxHeight: 200,
                }}>
                  <ScrollView>
                    {searchResults.map((user) => (
                      <TouchableOpacity
                        key={user._id}
                        onPress={() => handleUserSelect(user)}
                        style={{
                          padding: 14,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.background,
                        }}
                      >
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                          {user.email}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </View>

        {/* Service Type */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Service Type *
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SERVICES.map((service) => (
              <TouchableOpacity
                key={service}
                onPress={() => setServiceType(service)}
                style={{
                  backgroundColor: serviceType === service ? '#8B5CF6' : colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: serviceType === service ? '#8B5CF6' : colors.border,
                }}
              >
                <Text style={{
                  color: serviceType === service ? 'white' : colors.text,
                  fontSize: 13,
                  fontWeight: '600',
                }}>
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Location *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 12,
              color: colors.text,
              fontSize: 15,
            }}
            placeholder="Enter location (city)"
            placeholderTextColor={colors.textSecondary}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Start Date */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Start Date *
          </Text>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: colors.text, fontSize: 15 }}>
              {startDate.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setStartDate(selectedDate);
                  if (selectedDate > endDate) setEndDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Duration */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Duration *
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  padding: 14,
                  borderRadius: 12,
                  color: colors.text,
                  fontSize: 15,
                }}
                placeholder="Enter duration"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                value={durationValue}
                onChangeText={setDurationValue}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setDurationType('hours')}
                style={{
                  backgroundColor: durationType === 'hours' ? '#8B5CF6' : colors.surface,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
              >
                <Text style={{
                  color: durationType === 'hours' ? 'white' : colors.text,
                  fontWeight: '600',
                }}>
                  Hours
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDurationType('days')}
                style={{
                  backgroundColor: durationType === 'days' ? '#8B5CF6' : colors.surface,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
              >
                <Text style={{
                  color: durationType === 'days' ? 'white' : colors.text,
                  fontWeight: '600',
                }}>
                  Days
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Total Amount */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Total Amount (₹) *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 12,
              color: colors.text,
              fontSize: 15,
            }}
            placeholder="Enter amount"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={totalAmount}
            onChangeText={setTotalAmount}
          />
        </View>

        {/* Message */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Message (Optional)
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 12,
              color: colors.text,
              fontSize: 15,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
            placeholder="Add a message for the user..."
            placeholderTextColor={colors.textSecondary}
            multiline
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isBuddyLoading}
          style={{
            backgroundColor: '#8B5CF6',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 40,
            opacity: isBuddyLoading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            {isBuddyLoading ? 'Creating Booking...' : 'Create Booking'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
