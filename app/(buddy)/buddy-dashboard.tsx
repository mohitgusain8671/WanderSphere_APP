import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router } from 'expo-router';

export default function BuddyDashboardScreen() {
  const { colors, isDarkMode } = useTheme();
  const { myBuddyProfile, isBuddyLoading, getMyBuddyProfile, user } = useAppStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    await getMyBuddyProfile();
  };

  // Not Registered
  if (!isBuddyLoading && !myBuddyProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
              Become a Local Buddy
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#8B5CF6',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Ionicons name="briefcase" size={60} color="white" />
            </View>
            
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 12 }}>
              Share Your Local Expertise
            </Text>
            
            <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 20 }}>
              Become a local buddy and help travelers explore your city while earning money
            </Text>

            {/* Benefits */}
            <View style={{ width: '100%', marginBottom: 32 }}>
              {[
                { icon: 'cash', title: 'Earn Money', desc: 'Set your own rates and earn from your expertise' },
                { icon: 'people', title: 'Meet Travelers', desc: 'Connect with people from around the world' },
                { icon: 'time', title: 'Flexible Schedule', desc: 'Work on your own time and availability' },
                { icon: 'star', title: 'Build Reputation', desc: 'Get reviews and grow your profile' },
              ].map((benefit, index) => (
                <View key={index} style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Ionicons name={benefit.icon as any} size={24} color="#8B5CF6" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2 }}>
                      {benefit.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                      {benefit.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(buddy)/buddy-registration' as any)}
              style={{
                backgroundColor: '#8B5CF6',
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 12,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                Register as Local Buddy
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Loading
  if (isBuddyLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading profile...</Text>
      </View>
    );
  }

  const buddy = myBuddyProfile;

  // Pending Status
  if (buddy.status === 'pending') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
              Buddy Dashboard
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#F59E0B',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
          }}>
            <Ionicons name="time" size={60} color="white" />
          </View>
          
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 12 }}>
            Under Review
          </Text>
          
          <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
            Your buddy registration is being reviewed by our admin team. You'll receive an email once it's approved.
          </Text>
        </View>
      </View>
    );
  }

  // Rejected Status
  if (buddy.status === 'rejected') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
              Buddy Dashboard
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#EF4444',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Ionicons name="close-circle" size={60} color="white" />
            </View>
            
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 12 }}>
              Registration Rejected
            </Text>
            
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 32,
              width: '100%',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Reason:
              </Text>
              <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>
                {buddy.rejectionReason || 'Not specified'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(buddy)/edit-buddy-profile' as any)}
              style={{
                backgroundColor: '#8B5CF6',
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 12,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                Edit & Resubmit
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Approved - Full Dashboard
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, flex: 1 }}>
            Buddy Dashboard
          </Text>
          <TouchableOpacity onPress={() => router.push('/(buddy)/edit-buddy-profile' as any)}>
            <Ionicons name="settings" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Summary */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: buddy.profilePicture || user?.profilePicture }}
            style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.background }}
          />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
              {buddy.buddyName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={{ marginLeft: 6, fontSize: 15, color: colors.text, fontWeight: '600' }}>
                {buddy.rating.average.toFixed(1)}
              </Text>
              <Text style={{ marginLeft: 6, fontSize: 13, color: colors.textSecondary }}>
                ({buddy.rating.count} reviews)
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#3B82F6' }}>
              {buddy.totalBookings}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Total Bookings
            </Text>
          </View>
          
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#10B981' }}>
              {buddy.completedBookings}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Completed
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Quick Actions
        </Text>

        <View style={{ gap: 12, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.push('/(buddy)/booking-requests' as any)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#F59E0B',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="notifications" size={24} color="white" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                Booking Requests
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                View and respond to requests
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(buddy)/buddy-booking-history' as any)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="time" size={24} color="white" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                Booking History
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                View all your bookings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(buddy)/buddy-reviews' as any)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#F59E0B',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="star" size={24} color="white" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                Reviews & Ratings
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                See what customers say
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(buddy)/create-booking-for-user' as any)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#10B981',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="add-circle" size={24} color="white" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                Create Booking
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Create booking for a user
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(buddy)/edit-buddy-profile' as any)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#8B5CF6',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                Edit Profile
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Update your information
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
