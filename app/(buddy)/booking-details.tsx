import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

const STATUS_COLORS: any = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  rejected: '#EF4444',
  ongoing: '#8B5CF6',
  completed: '#10B981',
  cancelled: '#6B7280',
};

export default function BookingDetailsScreen() {
  const { colors, isDarkMode } = useTheme();
  const { id } = useLocalSearchParams();
  const { selectedBooking, isBuddyLoading, getBookingById, updateBookingStatus } = useAppStore();

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id]);

  const loadBooking = async () => {
    await getBookingById(id as string);
  };

  const handleStatusUpdate = (newStatus: string) => {
    const statusMessages: any = {
      ongoing: 'Mark this booking as ongoing?',
      completed: 'Mark this booking as completed?',
      cancelled: 'Cancel this booking?',
    };

    Alert.alert(
      'Confirm',
      statusMessages[newStatus],
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const result = await updateBookingStatus(id as string, newStatus);
            if (result.success) {
              Alert.alert('Success', `Booking ${newStatus} successfully`);
              loadBooking();
            } else {
              Alert.alert('Error', result.error || 'Failed to update booking');
            }
          },
        },
      ]
    );
  };

  const handleChat = () => {
    if (selectedBooking?.chatId) {
      router.push(`/(tabs)/messages?chatId=${selectedBooking.chatId}` as any);
    } else {
      Alert.alert('Info', 'Chat will be available once booking is accepted');
    }
  };

  if (isBuddyLoading || !selectedBooking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading booking details...</Text>
      </View>
    );
  }

  const booking = selectedBooking;
  const buddy = booking.buddyId;
  const user = booking.userId;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
              Booking Details
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
              {booking.bookingId}
            </Text>
          </View>
          <TouchableOpacity onPress={handleChat}>
            <Ionicons name="chatbubble-ellipses" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Status Badge */}
        <View style={{
          backgroundColor: STATUS_COLORS[booking.status],
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          alignSelf: 'flex-start',
        }}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 13, textTransform: 'capitalize' }}>
            {booking.status}
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Buddy/User Info */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
            {booking.initiatedBy === 'user' ? 'Local Buddy' : 'Customer'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: booking.initiatedBy === 'user' ? buddy?.profilePicture : user?.profilePicture }}
              style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.background }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                {booking.initiatedBy === 'user' ? buddy?.buddyName : `${user?.firstName} ${user?.lastName}`}
              </Text>
              {booking.initiatedBy === 'user' && buddy?.rating && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={{ marginLeft: 4, fontSize: 13, color: colors.text, fontWeight: '600' }}>
                    {buddy.rating.average.toFixed(1)} ({buddy.rating.count} reviews)
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="call" size={14} color={colors.textSecondary} />
                <Text style={{ marginLeft: 4, fontSize: 13, color: colors.textSecondary }}>
                  {booking.initiatedBy === 'user' ? buddy?.phone : user?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Service Details */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
            Service Details
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Service Type</Text>
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600' }}>{booking.serviceType}</Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Location</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={16} color="#3B82F6" />
              <Text style={{ marginLeft: 6, fontSize: 15, color: colors.text, fontWeight: '600' }}>
                {booking.location?.city}, {booking.location?.country}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Start Date</Text>
              <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600' }}>
                {new Date(booking.startDate).toLocaleDateString()}
              </Text>
            </View>
            {booking.endDate && (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>End Date</Text>
                <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600' }}>
                  {new Date(booking.endDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Duration</Text>
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600' }}>
              {booking.duration?.hours && `${booking.duration.hours} hours`}
              {booking.duration?.days && `${booking.duration.days} days`}
            </Text>
          </View>

          <View style={{
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
            padding: 12,
            borderRadius: 12,
            marginTop: 8,
          }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Total Amount</Text>
            <Text style={{ fontSize: 24, color: '#10B981', fontWeight: '800' }}>
              ₹{booking.totalAmount}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="cash" size={14} color="#10B981" />
              <Text style={{ marginLeft: 4, fontSize: 12, color: '#10B981', fontWeight: '600' }}>
                Payment Mode: Cash
              </Text>
            </View>
          </View>
        </View>

        {/* User Message */}
        {booking.message && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
              Message
            </Text>
            <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
              {booking.message}
            </Text>
          </View>
        )}

        {/* Buddy Response */}
        {booking.buddyResponse?.message && (
          <View style={{
            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#3B82F6',
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
              Buddy Response
            </Text>
            <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
              {booking.buddyResponse.message}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>
              {new Date(booking.buddyResponse.respondedAt).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Status Timeline */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
            Booking Timeline
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#10B981',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="checkmark" size={18} color="white" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Created</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                {new Date(booking.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          {booking.buddyResponse?.respondedAt && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: booking.status === 'rejected' ? '#EF4444' : '#10B981',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name={booking.status === 'rejected' ? 'close' : 'checkmark'} size={18} color="white" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                  {booking.status === 'rejected' ? 'Rejected' : 'Accepted'}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {new Date(booking.buddyResponse.respondedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {booking.status === 'completed' && booking.submittedAt && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#10B981',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name="checkmark-done" size={18} color="white" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Completed</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {new Date(booking.submittedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ marginBottom: 40 }}>
          {booking.status === 'pending' && (
            <TouchableOpacity
              onPress={() => handleStatusUpdate('cancelled')}
              style={{
                backgroundColor: '#EF4444',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Cancel Booking</Text>
            </TouchableOpacity>
          )}

          {booking.status === 'accepted' && (
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => handleStatusUpdate('ongoing')}
                style={{
                  backgroundColor: '#8B5CF6',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Mark as Ongoing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleStatusUpdate('cancelled')}
                style={{
                  backgroundColor: colors.surface,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#EF4444',
                }}
              >
                <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '700' }}>Cancel Booking</Text>
              </TouchableOpacity>
            </View>
          )}

          {booking.status === 'ongoing' && (
            <TouchableOpacity
              onPress={() => handleStatusUpdate('completed')}
              style={{
                backgroundColor: '#10B981',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Mark as Completed</Text>
            </TouchableOpacity>
          )}

          {booking.status === 'completed' && !booking.rating?.score && (
            <TouchableOpacity
              onPress={() => router.push(`/(buddy)/rate-booking?id=${booking._id}` as any)}
              style={{
                backgroundColor: '#F59E0B',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Rate & Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
