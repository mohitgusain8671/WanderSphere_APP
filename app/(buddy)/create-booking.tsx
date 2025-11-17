import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const SERVICES = [
  'Tour Guide',
  'Transportation',
  'Accommodation Help',
  'Language Translation',
  'Photography',
  'Food Guide',
  'Adventure Activities',
  'Cultural Experience',
  'Shopping Assistant',
  'Event Planning',
  'Airport Pickup',
  'Custom Services',
];

export default function CreateBookingScreen() {
  const { colors } = useTheme();
  const { buddyId } = useLocalSearchParams();
  const { selectedBuddy, createBookingRequest, isBuddyLoading, getBuddyById } = useAppStore();

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

  useEffect(() => {
    if (buddyId && !selectedBuddy) {
      getBuddyById(buddyId as string);
    }
  }, [buddyId]);

  useEffect(() => {
    calculateAmount();
  }, [durationType, durationValue, selectedBuddy]);

  const calculateAmount = () => {
    if (!selectedBuddy?.buddy) return;
    
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

    const pricing = selectedBuddy.buddy.pricing;
    let amount = 0;

    if (durationType === 'hours' && pricing.hourlyRate) {
      amount = pricing.hourlyRate * duration;
    } else if (durationType === 'days' && pricing.perDayCharge) {
      amount = pricing.perDayCharge * duration;
    }

    setTotalAmount(amount.toString());
  };

  const handleSubmit = async () => {
    if (!serviceType || !location || !durationValue || !totalAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const duration = parseFloat(durationValue);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    const bookingData = {
      buddyId: selectedBuddy?.buddy._id,
      serviceType,
      location: {
        city: location,
        country: 'India', // You can make this dynamic
      },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: {
        [durationType]: duration,
      },
      totalAmount: parseFloat(totalAmount),
      message,
    };

    const result = await createBookingRequest(bookingData);
    
    if (result.success) {
      Alert.alert(
        'Success',
        'Booking request sent successfully! The buddy will respond soon.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(buddy)/user-bookings' as any),
          },
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to create booking');
    }
  };

  const buddy = selectedBuddy?.buddy;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
              Create Booking
            </Text>
            {buddy && (
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                with {buddy.buddyName}
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
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
                  backgroundColor: serviceType === service ? '#3B82F6' : colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: serviceType === service ? '#3B82F6' : colors.border,
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
                  if (selectedDate > endDate) {
                    setEndDate(selectedDate);
                  }
                }
              }}
            />
          )}
        </View>

        {/* End Date */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            End Date (Optional)
          </Text>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
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
              {endDate.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              minimumDate={startDate}
              onChange={(event, selectedDate) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setEndDate(selectedDate);
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
                  backgroundColor: durationType === 'hours' ? '#3B82F6' : colors.surface,
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
                  backgroundColor: durationType === 'days' ? '#3B82F6' : colors.surface,
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
          {buddy && (
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>
              Buddy's rate: ₹{durationType === 'hours' ? buddy.pricing.hourlyRate : buddy.pricing.perDayCharge}/{durationType === 'hours' ? 'hr' : 'day'}
            </Text>
          )}
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
            placeholder="Add a message for the buddy..."
            placeholderTextColor={colors.textSecondary}
            multiline
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Payment Mode Info */}
        <View style={{
          backgroundColor: colors.surface,
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Ionicons name="cash" size={24} color="#10B981" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
              Payment Mode: Cash Only
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
              Pay directly to the buddy after service completion
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isBuddyLoading}
          style={{
            backgroundColor: '#3B82F6',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 40,
            opacity: isBuddyLoading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            {isBuddyLoading ? 'Sending Request...' : 'Send Booking Request'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
