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

export default function BuddyProfileScreen() {
  const { colors, isDarkMode } = useTheme();
  const { id } = useLocalSearchParams();
  const { selectedBuddy, isBuddyLoading, getBuddyById } = useAppStore();
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

  useEffect(() => {
    if (id) {
      loadBuddyProfile();
    }
  }, [id]);

  const loadBuddyProfile = async () => {
    await getBuddyById(id as string);
  };

  const handleBookNow = () => {
    router.push(`/(buddy)/create-booking?buddyId=${id}` as any);
  };

  const handleReport = () => {
    router.push(`/(buddy)/report-buddy?buddyId=${id}` as any);
  };

  const handleChat = () => {
    // Navigate to chat with buddy
    Alert.alert('Chat', 'Chat functionality will be available after booking');
  };

  if (isBuddyLoading || !selectedBuddy) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading buddy profile...</Text>
      </View>
    );
  }

  const { buddy, reviews } = selectedBuddy;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, paddingTop: 45, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, flex: 1 }}>
            Buddy Profile
          </Text>
          <TouchableOpacity onPress={handleReport}>
            <Ionicons name="flag-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Image
              source={{ uri: buddy.profilePicture || buddy.userId?.profilePicture }}
              style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.background }}
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
                {buddy.buddyName}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text style={{ marginLeft: 6, fontSize: 16, color: colors.text, fontWeight: '700' }}>
                  {buddy.rating.average.toFixed(1)}
                </Text>
                <Text style={{ marginLeft: 6, fontSize: 14, color: colors.textSecondary }}>
                  ({buddy.rating.count} reviews)
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={{ marginLeft: 6, fontSize: 13, color: colors.textSecondary }}>
                  {buddy.completedBookings} completed
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={handleBookNow}
              style={{
                flex: 1,
                backgroundColor: '#3B82F6',
                padding: 14,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="calendar" size={20} color="white" />
              <Text style={{ color: 'white', fontWeight: '700', marginLeft: 8, fontSize: 15 }}>
                Book Now
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleChat}
              style={{
                backgroundColor: '#10B981',
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                width: 50,
              }}
            >
              <Ionicons name="chatbubble" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={() => setActiveTab('about')}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'about' ? '#3B82F6' : 'transparent',
          }}
        >
          <Text style={{
            textAlign: 'center',
            fontWeight: '600',
            color: activeTab === 'about' ? '#3B82F6' : colors.textSecondary,
          }}>
            About
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('reviews')}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'reviews' ? '#3B82F6' : 'transparent',
          }}
        >
          <Text style={{
            textAlign: 'center',
            fontWeight: '600',
            color: activeTab === 'reviews' ? '#3B82F6' : colors.textSecondary,
          }}>
            Reviews ({reviews?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {activeTab === 'about' ? (
          <>
            {/* Description */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
                About Me
              </Text>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22 }}>
                {buddy.description}
              </Text>
            </View>

            {/* Services */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
                Services Offered
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {buddy.services.map((service: string, index: number) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 16,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: '#3B82F6', fontWeight: '600' }}>
                      {service}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Locations */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
                Service Locations
              </Text>
              {buddy.locations.map((loc: any, index: number) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="location" size={18} color="#3B82F6" />
                  <Text style={{ marginLeft: 8, fontSize: 14, color: colors.text }}>
                    {loc.city}{loc.state ? `, ${loc.state}` : ''}, {loc.country}
                  </Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
                Pricing
              </Text>
              {buddy.pricing.hourlyRate > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Hourly Rate</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#10B981' }}>
                    ₹{buddy.pricing.hourlyRate}/hr
                  </Text>
                </View>
              )}
              {buddy.pricing.perDayCharge > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Per Day Charge</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#10B981' }}>
                    ₹{buddy.pricing.perDayCharge}/day
                  </Text>
                </View>
              )}
              {buddy.pricing.customPackageCharge > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Custom Package</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#10B981' }}>
                    ₹{buddy.pricing.customPackageCharge}
                  </Text>
                </View>
              )}
            </View>

            {/* Contact */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
                Contact Information
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="call" size={18} color="#3B82F6" />
                <Text style={{ marginLeft: 8, fontSize: 14, color: colors.text }}>
                  {buddy.phone}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail" size={18} color="#3B82F6" />
                <Text style={{ marginLeft: 8, fontSize: 14, color: colors.text }}>
                  {buddy.email}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Reviews */}
            {reviews && reviews.length > 0 ? (
              reviews.map((review: any, index: number) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Image
                      source={{ uri: review.user?.profilePicture }}
                      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background }}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                        {review.user?.firstName} {review.user?.lastName}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={14}
                            color="#F59E0B"
                          />
                        ))}
                        <Text style={{ marginLeft: 8, fontSize: 12, color: colors.textSecondary }}>
                          {new Date(review.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {review.review && (
                    <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
                      {review.review}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
                  No reviews yet
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
