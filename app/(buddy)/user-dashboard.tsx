import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router } from 'expo-router';
import * as Location from 'expo-location';

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

export default function UserDashboardScreen() {
  const { colors, isDarkMode } = useTheme();
  const { buddies, isBuddyLoading, searchBuddies, buddyPagination } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    services: [] as string[],
    minRating: '',
    maxPrice: '',
  });
  const [useGPS, setUseGPS] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    handleSearch();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCoordinates({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setUseGPS(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  };

  const handleSearch = async () => {
    const searchParams: any = {};
    
    if (searchQuery.trim()) {
      searchParams.buddyName = searchQuery.trim();
    }
    
    if (location.trim() && !useGPS) {
      searchParams.location = location.trim();
    }
    
    if (useGPS && coordinates) {
      searchParams.latitude = coordinates.latitude;
      searchParams.longitude = coordinates.longitude;
    }
    
    if (filters.services.length > 0) {
      searchParams.services = filters.services;
    }
    
    if (filters.minRating) {
      searchParams.minRating = filters.minRating;
    }
    
    if (filters.maxPrice) {
      searchParams.maxPrice = filters.maxPrice;
    }

    await searchBuddies(searchParams);
  };

  const toggleService = (service: string) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const clearFilters = () => {
    setFilters({
      services: [],
      minRating: '',
      maxPrice: '',
    });
    setSearchQuery('');
    setLocation('');
    setUseGPS(false);
    setCoordinates(null);
    // Trigger search with cleared filters
    searchBuddies({});
  };

  const handleGPSToggle = async () => {
    if (!useGPS) {
      const granted = await requestLocationPermission();
      if (granted) {
        setLocation('');
      }
    } else {
      setUseGPS(false);
      setCoordinates(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 45 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, flex: 1 }}>
            Find Local Buddy
          </Text>
          <TouchableOpacity onPress={() => router.push('/(buddy)/user-bookings' as any)}>
            <Ionicons name="time-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, color: colors.text, fontSize: 15 }}
              placeholder="Search by buddy name..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Location Search */}
        <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location" size={20} color={colors.textSecondary} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, color: colors.text, fontSize: 15 }}
              placeholder="Enter location..."
              placeholderTextColor={colors.textSecondary}
              value={location}
              onChangeText={setLocation}
              editable={!useGPS}
            />
            <TouchableOpacity onPress={handleGPSToggle}>
              <Ionicons 
                name={useGPS ? "navigate" : "navigate-outline"} 
                size={24} 
                color={useGPS ? '#3B82F6' : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={{
              flex: 1,
              backgroundColor: '#3B82F6',
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="options" size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>
              Filters {filters.services.length > 0 && `(${filters.services.length})`}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSearch}
            style={{
              flex: 1,
              backgroundColor: '#10B981',
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="search" size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {isBuddyLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Searching buddies...</Text>
          </View>
        ) : buddies.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
              No local buddies found. Try adjusting your search criteria.
            </Text>
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16 }}>
              Found {buddyPagination?.total || buddies.length} local buddies
            </Text>
            {buddies.map((buddy: any) => (
              <TouchableOpacity
                key={buddy._id}
                onPress={() => router.push(`/(buddy)/buddy-profile?id=${buddy._id}` as any)}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <Image
                    source={{ uri: buddy.profilePicture || buddy.userId?.profilePicture }}
                    style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.background }}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                      {buddy.buddyName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={{ marginLeft: 4, fontSize: 14, color: colors.text, fontWeight: '600' }}>
                        {buddy.rating.average.toFixed(1)}
                      </Text>
                      <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
                        ({buddy.rating.count} reviews)
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={{ marginLeft: 4, fontSize: 12, color: colors.textSecondary }}>
                        {buddy.completedBookings} bookings completed
                      </Text>
                    </View>
                  </View>
                </View>

                <Text 
                  style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}
                  numberOfLines={2}
                >
                  {buddy.description}
                </Text>

                {/* Services */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {buddy.services.slice(0, 3).map((service: string, index: number) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: '#3B82F6', fontWeight: '600' }}>
                        {service}
                      </Text>
                    </View>
                  ))}
                  {buddy.services.length > 3 && (
                    <View
                      style={{
                        backgroundColor: colors.background,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}>
                        +{buddy.services.length - 3} more
                      </Text>
                    </View>
                  )}
                </View>

                {/* Pricing */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    {buddy.pricing.hourlyRate > 0 && (
                      <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>
                        ₹{buddy.pricing.hourlyRate}/hr
                      </Text>
                    )}
                    {buddy.pricing.perDayCharge > 0 && (
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        ₹{buddy.pricing.perDayCharge}/day
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      backgroundColor: '#3B82F6',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>View Profile</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Services */}
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                Services
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {SERVICES.map((service) => (
                  <TouchableOpacity
                    key={service}
                    onPress={() => toggleService(service)}
                    style={{
                      backgroundColor: filters.services.includes(service) ? '#3B82F6' : colors.background,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: filters.services.includes(service) ? '#3B82F6' : colors.border,
                    }}
                  >
                    <Text style={{ 
                      color: filters.services.includes(service) ? 'white' : colors.text,
                      fontSize: 13,
                      fontWeight: '600',
                    }}>
                      {service}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Min Rating */}
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                Minimum Rating
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  padding: 12,
                  borderRadius: 12,
                  color: colors.text,
                  marginBottom: 24,
                }}
                placeholder="e.g., 4.0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                value={filters.minRating}
                onChangeText={(text) => setFilters(prev => ({ ...prev, minRating: text }))}
              />

              {/* Max Price */}
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                Maximum Price (per hour)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  padding: 12,
                  borderRadius: 12,
                  color: colors.text,
                  marginBottom: 24,
                }}
                placeholder="e.g., 500"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={filters.maxPrice}
                onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
              />

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    clearFilters();
                    setShowFilters(false);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Clear</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    setShowFilters(false);
                    handleSearch();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#3B82F6',
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
