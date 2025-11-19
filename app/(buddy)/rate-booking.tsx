import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

export default function RateBookingScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const { selectedBooking, isBuddyLoading, getBookingById, rateBooking } = useAppStore();
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id]);

  const loadBooking = async () => {
    await getBookingById(id as string);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    const result = await rateBooking(id as string, rating, review);
    
    if (result.success) {
      Alert.alert(
        'Success',
        'Thank you for your feedback!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(buddy)/user-bookings' as any),
          },
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to submit rating');
    }
  };

  if (!selectedBooking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  const buddy = selectedBooking.buddyId;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 45 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Rate & Review
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Buddy Info */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 24, alignItems: 'center' }}>
          <Image
            source={{ uri: buddy?.profilePicture }}
            style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.background, marginBottom: 12 }}
          />
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
            {buddy?.buddyName}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {selectedBooking.serviceType}
          </Text>
        </View>

        {/* Rating */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16, textAlign: 'center' }}>
            How was your experience?
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={{
                  padding: 8,
                }}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={48}
                  color={star <= rating ? '#F59E0B' : colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#F59E0B', textAlign: 'center', marginTop: 12 }}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </Text>
          )}
        </View>

        {/* Review */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Write a Review (Optional)
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              color: colors.text,
              fontSize: 15,
              minHeight: 150,
              textAlignVertical: 'top',
            }}
            placeholder="Share your experience with this buddy..."
            placeholderTextColor={colors.textSecondary}
            multiline
            value={review}
            onChangeText={setReview}
            maxLength={1000}
          />
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8, textAlign: 'right' }}>
            {review.length}/1000
          </Text>
        </View>

        {/* Tips */}
        <View style={{
          backgroundColor: colors.surface,
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '600', color: colors.text }}>
              Tips for a great review
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20 }}>
            • Be specific about what you liked or didn't like{'\n'}
            • Mention the buddy's professionalism and knowledge{'\n'}
            • Share how the service helped you{'\n'}
            • Be honest and constructive
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isBuddyLoading || rating === 0}
          style={{
            backgroundColor: rating === 0 ? colors.textSecondary : '#F59E0B',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 40,
            opacity: (isBuddyLoading || rating === 0) ? 0.6 : 1,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            {isBuddyLoading ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
