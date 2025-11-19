import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router } from 'expo-router';

export default function BookingRequestsScreen() {
  const { colors } = useTheme();
  const { buddyBookings, isBuddyLoading, getBuddyBookingHistory, respondToBooking } = useAppStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [responseAction, setResponseAction] = useState<'accept' | 'reject'>('accept');
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    await getBuddyBookingHistory({ status: 'pending' });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleResponseClick = (booking: any, action: 'accept' | 'reject') => {
    setSelectedBooking(booking);
    setResponseAction(action);
    setResponseMessage('');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedBooking) return;

    const result = await respondToBooking(
      selectedBooking._id,
      responseAction,
      responseMessage.trim()
    );

    if (result.success) {
      setShowResponseModal(false);
      Alert.alert(
        'Success',
        `Booking ${responseAction === 'accept' ? 'accepted' : 'rejected'} successfully`
      );
      loadRequests();
    } else {
      Alert.alert('Error', result.error || 'Failed to respond to booking');
    }
  };

  const pendingBookings = buddyBookings.filter((b: any) => b.status === 'pending');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 45 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Booking Requests
          </Text>
        </View>

        {/* Stats */}
        <View style={{
          backgroundColor: colors.background,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#F59E0B',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: 'white' }}>
              {pendingBookings.length}
            </Text>
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              Pending Requests
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              Respond to booking requests
            </Text>
          </View>
        </View>
      </View>

      {/* Requests List */}
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#F59E0B']} />
        }
      >
        {isBuddyLoading && !refreshing ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading requests...</Text>
          </View>
        ) : pendingBookings.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
              No pending booking requests
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
              New requests will appear here
            </Text>
          </View>
        ) : (
          pendingBookings.map((booking: any) => (
            <View
              key={booking._id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#F59E0B',
              }}
            >
              {/* User Info */}
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <Image
                  source={{ uri: booking.userId?.profilePicture }}
                  style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.background }}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {booking.userId?.firstName} {booking.userId?.lastName}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                    {booking.userId?.email}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="time" size={14} color={colors.textSecondary} />
                    <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
                      {new Date(booking.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#10B981' }}>
                    ₹{booking.totalAmount}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                    {booking.bookingId}
                  </Text>
                </View>
              </View>

              {/* Service Details */}
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="briefcase" size={16} color="#3B82F6" />
                  <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '600', color: colors.text }}>
                    {booking.serviceType}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                    <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
                      {new Date(booking.startDate).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {booking.duration?.hours && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="time" size={14} color={colors.textSecondary} />
                      <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
                        {booking.duration.hours} hours
                      </Text>
                    </View>
                  )}
                  
                  {booking.duration?.days && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="sunny" size={14} color={colors.textSecondary} />
                      <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
                        {booking.duration.days} days
                      </Text>
                    </View>
                  )}
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="location" size={14} color={colors.textSecondary} />
                    <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
                      {booking.location?.city}
                    </Text>
                  </View>
                </View>
              </View>

              {/* User Message */}
              {booking.message && (
                <View style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                    Message from user:
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                    {booking.message}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => handleResponseClick(booking, 'accept')}
                  style={{
                    flex: 1,
                    backgroundColor: '#10B981',
                    padding: 14,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={{ color: 'white', fontWeight: '700', marginLeft: 8, fontSize: 15 }}>
                    Accept
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleResponseClick(booking, 'reject')}
                  style={{
                    flex: 1,
                    backgroundColor: '#EF4444',
                    padding: 14,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="white" />
                  <Text style={{ color: 'white', fontWeight: '700', marginLeft: 8, fontSize: 15 }}>
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>

              {/* View Details */}
              <TouchableOpacity
                onPress={() => router.push(`/(buddy)/booking-details?id=${booking._id}` as any)}
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>
                  View Full Details
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Response Modal */}
      <Modal visible={showResponseModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                {responseAction === 'accept' ? 'Accept Booking' : 'Reject Booking'}
              </Text>
              <TouchableOpacity onPress={() => setShowResponseModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  {selectedBooking.userId?.firstName} {selectedBooking.userId?.lastName}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  {selectedBooking.serviceType} • ₹{selectedBooking.totalAmount}
                </Text>
              </View>
            )}

            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
              Message (Optional)
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.background,
                padding: 14,
                borderRadius: 12,
                color: colors.text,
                fontSize: 15,
                minHeight: 100,
                textAlignVertical: 'top',
                marginBottom: 20,
              }}
              placeholder={
                responseAction === 'accept'
                  ? 'Add a message for the user (e.g., meeting point, what to bring...)'
                  : 'Explain why you are rejecting this request...'
              }
              placeholderTextColor={colors.textSecondary}
              multiline
              value={responseMessage}
              onChangeText={setResponseMessage}
              maxLength={500}
            />

            <TouchableOpacity
              onPress={handleSubmitResponse}
              disabled={isBuddyLoading}
              style={{
                backgroundColor: responseAction === 'accept' ? '#10B981' : '#EF4444',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                opacity: isBuddyLoading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                {isBuddyLoading
                  ? 'Submitting...'
                  : responseAction === 'accept'
                  ? 'Confirm Accept'
                  : 'Confirm Reject'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
