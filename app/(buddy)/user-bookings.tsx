import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router } from 'expo-router';

const STATUS_COLORS: any = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  rejected: '#EF4444',
  ongoing: '#8B5CF6',
  completed: '#10B981',
  cancelled: '#6B7280',
};

const STATUS_ICONS: any = {
  pending: 'time',
  accepted: 'checkmark-circle',
  rejected: 'close-circle',
  ongoing: 'play-circle',
  completed: 'checkmark-done-circle',
  cancelled: 'ban',
};

export default function UserBookingsScreen() {
  const { colors } = useTheme();
  const { userBookings, isBuddyLoading, getUserBookingHistory } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  const loadBookings = async () => {
    const filters: any = {};
    if (activeTab !== 'all') {
      filters.status = activeTab;
    }
    await getUserBookingHistory(filters);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getFilteredBookings = () => {
    if (activeTab === 'all') return userBookings;
    return userBookings.filter((b: any) => b.status === activeTab);
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
  ];

  const filteredBookings = getFilteredBookings();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 45 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            My Bookings
          </Text>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  backgroundColor: activeTab === tab.key ? '#3B82F6' : colors.background,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 20,
                }}
              >
                <Text style={{
                  color: activeTab === tab.key ? 'white' : colors.text,
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} />
        }
      >
        {isBuddyLoading && !refreshing ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading bookings...</Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
              No bookings found
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking: any) => (
            <TouchableOpacity
              key={booking._id}
              onPress={() => router.push(`/(buddy)/booking-details?id=${booking._id}` as any)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: STATUS_COLORS[booking.status],
              }}
            >
              {/* Booking Header */}
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <Image
                  source={{ uri: booking.buddyId?.profilePicture }}
                  style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.background }}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {booking.buddyId?.buddyName}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                    {booking.serviceType}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons 
                      name={STATUS_ICONS[booking.status]} 
                      size={14} 
                      color={STATUS_COLORS[booking.status]} 
                    />
                    <Text style={{
                      marginLeft: 4,
                      fontSize: 12,
                      color: STATUS_COLORS[booking.status],
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}>
                      {booking.status}
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

              {/* Booking Details */}
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

              {/* Rate Button for Completed */}
              {booking.status === 'completed' && !booking.rating?.score && (
                <TouchableOpacity
                  onPress={() => router.push(`/(buddy)/rate-booking?id=${booking._id}` as any)}
                  style={{
                    backgroundColor: '#F59E0B',
                    padding: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>
                    Rate & Review
                  </Text>
                </TouchableOpacity>
              )}

              {/* Already Rated */}
              {booking.rating?.score && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 12,
                  padding: 8,
                  backgroundColor: colors.background,
                  borderRadius: 8,
                }}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={{ marginLeft: 6, fontSize: 13, color: colors.text, fontWeight: '600' }}>
                    You rated {booking.rating.score}/5
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
