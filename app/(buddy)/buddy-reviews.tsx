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

export default function BuddyReviewsScreen() {
  const { colors } = useTheme();
  const { myBuddyProfile, buddyBookings, isBuddyLoading, getMyBuddyProfile, getBuddyBookingHistory } = useAppStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await getMyBuddyProfile();
    await getBuddyBookingHistory({ status: 'completed' });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getReviews = () => {
    const reviewedBookings = buddyBookings.filter((b: any) => b.rating?.score);
    
    let sorted = [...reviewedBookings];
    if (sortBy === 'recent') {
      sorted.sort((a, b) => new Date(b.rating.ratedAt).getTime() - new Date(a.rating.ratedAt).getTime());
    } else if (sortBy === 'highest') {
      sorted.sort((a, b) => b.rating.score - a.rating.score);
    } else if (sortBy === 'lowest') {
      sorted.sort((a, b) => a.rating.score - b.rating.score);
    }
    
    return sorted;
  };

  const reviews = getReviews();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Reviews & Ratings
          </Text>
        </View>

        {/* Overall Rating */}
        {myBuddyProfile && (
          <View style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 48, fontWeight: '800', color: '#F59E0B' }}>
              {myBuddyProfile.rating.average.toFixed(1)}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(myBuddyProfile.rating.average) ? 'star' : 'star-outline'}
                  size={24}
                  color="#F59E0B"
                />
              ))}
            </View>
            <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600' }}>
              {myBuddyProfile.rating.count} {myBuddyProfile.rating.count === 1 ? 'Review' : 'Reviews'}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
              Based on {myBuddyProfile.completedBookings} completed bookings
            </Text>
          </View>
        )}
      </View>

      {/* Sort Options */}
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSortBy('recent')}
            style={{
              backgroundColor: sortBy === 'recent' ? '#F59E0B' : colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text style={{
              color: sortBy === 'recent' ? 'white' : colors.text,
              fontWeight: '600',
              fontSize: 13,
            }}>
              Most Recent
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setSortBy('highest')}
            style={{
              backgroundColor: sortBy === 'highest' ? '#F59E0B' : colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text style={{
              color: sortBy === 'highest' ? 'white' : colors.text,
              fontWeight: '600',
              fontSize: 13,
            }}>
              Highest Rated
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setSortBy('lowest')}
            style={{
              backgroundColor: sortBy === 'lowest' ? '#F59E0B' : colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text style={{
              color: sortBy === 'lowest' ? 'white' : colors.text,
              fontWeight: '600',
              fontSize: 13,
            }}>
              Lowest Rated
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reviews List */}
      <ScrollView
        style={{ flex: 1, padding: 16, paddingTop: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#F59E0B']} />
        }
      >
        {isBuddyLoading && !refreshing ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading reviews...</Text>
          </View>
        ) : reviews.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
              No reviews yet
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
              Complete bookings to receive reviews from users
            </Text>
          </View>
        ) : (
          reviews.map((booking: any) => (
            <View
              key={booking._id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {/* User Info */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Image
                  source={{ uri: booking.userId?.profilePicture }}
                  style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background }}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                    {booking.userId?.firstName} {booking.userId?.lastName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= booking.rating.score ? 'star' : 'star-outline'}
                        size={14}
                        color="#F59E0B"
                      />
                    ))}
                    <Text style={{ marginLeft: 8, fontSize: 12, color: colors.textSecondary }}>
                      {new Date(booking.rating.ratedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Service Info */}
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  {booking.serviceType} • {new Date(booking.startDate).toLocaleDateString()}
                </Text>
              </View>

              {/* Review Text */}
              {booking.rating.review && (
                <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
                  {booking.rating.review}
                </Text>
              )}

              {/* View Booking */}
              <TouchableOpacity
                onPress={() => router.push(`/(buddy)/booking-details?id=${booking._id}` as any)}
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>
                  View Booking Details
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
