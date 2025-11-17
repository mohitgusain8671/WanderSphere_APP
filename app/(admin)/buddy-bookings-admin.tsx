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

export default function BuddyBookingsAdminScreen() {
  const { colors } = useTheme();
  const { user, adminBookings, isAdminBookingsLoading, getAllBookings, buddyStatistics, getBuddyStatistics } = useAppStore();

  const hasPermission = user?.role === 'super_admin' || 
    (user?.role === 'admin' && user?.permissions?.includes('buddy_management'));
  
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (hasPermission) {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    const filters: any = {};
    if (activeTab !== 'all') {
      filters.status = activeTab;
    }
    await getAllBookings(filters);
    await getBuddyStatistics();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filteredBookings = activeTab === 'all'
    ? adminBookings
    : adminBookings.filter((b: any) => b.status === activeTab);

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: colors.background }}>
        <Ionicons name="lock-closed" size={64} color="#EF4444" />
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, textAlign: 'center' }}>
          Access Denied
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
          You don't have permission to view buddy bookings.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Buddy Bookings
          </Text>
        </View>

        {/* Statistics */}
        {buddyStatistics && (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#3B82F6' }}>
                {buddyStatistics.totalBookings}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Total</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#10B981' }}>
                {buddyStatistics.completedBookings}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Completed</Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  backgroundColor: activeTab === tab.key ? '#3B82F6' : colors.background,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text style={{
                  color: activeTab === tab.key ? 'white' : colors.text,
                  fontWeight: '600',
                  fontSize: 13,
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
        {isAdminBookingsLoading && !refreshing ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading bookings...</Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
              No bookings found
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking: any) => (
            <View
              key={booking._id}
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                    Booking ID: {booking.bookingId}
                  </Text>
                  <View style={{
                    backgroundColor: STATUS_COLORS[booking.status],
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    alignSelf: 'flex-start',
                  }}>
                    <Text style={{ fontSize: 11, color: 'white', fontWeight: '700', textTransform: 'capitalize' }}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#10B981' }}>
                    ₹{booking.totalAmount}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* User Info */}
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  Customer
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: booking.userId?.profilePicture }}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface }}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      {booking.userId?.firstName} {booking.userId?.lastName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {booking.userId?.email}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Buddy Info */}
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  Local Buddy
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: booking.buddyId?.profilePicture }}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface }}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      {booking.buddyId?.buddyName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {booking.buddyId?.email}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Service Details */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="briefcase" size={14} color={colors.textSecondary} />
                  <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
                    {booking.serviceType}
                  </Text>
                </View>
                
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

              {/* Rating */}
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
                    Rated {booking.rating.score}/5
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
