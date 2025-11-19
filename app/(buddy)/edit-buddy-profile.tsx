import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const SERVICES = [
  'Tour Guide', 'Transportation', 'Accommodation Help', 'Language Translation',
  'Photography', 'Food Guide', 'Adventure Activities', 'Cultural Experience',
  'Shopping Assistant', 'Event Planning', 'Airport Pickup', 'Custom Services',
];

export default function EditBuddyProfileScreen() {
  const { colors, isDarkMode } = useTheme();
  const { myBuddyProfile, updateBuddyProfile, updateBuddyRegistration, isBuddyLoading, getMyBuddyProfile } = useAppStore();

  const [formData, setFormData] = useState<any>(null);
  const [showServicePicker, setShowServicePicker] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (myBuddyProfile) {
      setFormData({
        buddyName: myBuddyProfile.buddyName,
        phone: myBuddyProfile.phone,
        email: myBuddyProfile.email,
        profilePicture: myBuddyProfile.profilePicture,
        description: myBuddyProfile.description,
        services: myBuddyProfile.services,
        locations: myBuddyProfile.locations,
        pricing: {
          hourlyRate: myBuddyProfile.pricing.hourlyRate?.toString() || '',
          perDayCharge: myBuddyProfile.pricing.perDayCharge?.toString() || '',
          customPackageCharge: myBuddyProfile.pricing.customPackageCharge?.toString() || '',
        },
        isAvailable: myBuddyProfile.isAvailable,
      });
    }
  }, [myBuddyProfile]);

  const loadProfile = async () => {
    await getMyBuddyProfile();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData((prev: any) => ({ ...prev, profilePicture: result.assets[0].uri }));
    }
  };

  const toggleService = (service: string) => {
    setFormData((prev: any) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s: string) => s !== service)
        : [...prev.services, service],
    }));
  };

  const addLocation = () => {
    setFormData((prev: any) => ({
      ...prev,
      locations: [...prev.locations, { city: '', state: '', country: 'India' }],
    }));
  };

  const updateLocation = (index: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      locations: prev.locations.map((loc: any, i: number) =>
        i === index ? { ...loc, [field]: value } : loc
      ),
    }));
  };

  const removeLocation = (index: number) => {
    if (formData.locations.length > 1) {
      setFormData((prev: any) => ({
        ...prev,
        locations: prev.locations.filter((_: any, i: number) => i !== index),
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.buddyName.trim()) {
      Alert.alert('Error', 'Please enter your buddy name');
      return;
    }

    const updateData = {
      ...formData,
      pricing: {
        hourlyRate: parseFloat(formData.pricing.hourlyRate) || 0,
        perDayCharge: parseFloat(formData.pricing.perDayCharge) || 0,
        customPackageCharge: parseFloat(formData.pricing.customPackageCharge) || 0,
      },
      locations: formData.locations.filter((loc: any) => loc.city.trim()),
    };

    const result = myBuddyProfile?.status === 'rejected'
      ? await updateBuddyRegistration(updateData)
      : await updateBuddyProfile(updateData);

    if (result.success) {
      Alert.alert(
        'Success',
        myBuddyProfile?.status === 'rejected'
          ? 'Your registration has been resubmitted for review'
          : 'Profile updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile');
    }
  };

  if (!formData) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 45 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Edit Profile
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Profile Picture */}
        <View style={{ marginBottom: 24, alignItems: 'center' }}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{ uri: formData.profilePicture }}
              style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.surface }}
            />
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#8B5CF6',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Availability Toggle */}
        {myBuddyProfile?.status === 'approved' && (
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                Available for Bookings
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                Turn off to stop receiving new booking requests
              </Text>
            </View>
            <Switch
              value={formData.isAvailable}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, isAvailable: value }))}
              trackColor={{ false: colors.border, true: '#8B5CF6' }}
              thumbColor="white"
            />
          </View>
        )}

        {/* Buddy Name */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Buddy Name *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 12,
              color: colors.text,
              fontSize: 15,
            }}
            value={formData.buddyName}
            onChangeText={(text) => setFormData((prev: any) => ({ ...prev, buddyName: text }))}
          />
        </View>

        {/* Phone */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Phone Number *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 12,
              color: colors.text,
              fontSize: 15,
            }}
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData((prev: any) => ({ ...prev, phone: text }))}
          />
        </View>

        {/* Email */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Email *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 12,
              color: colors.text,
              fontSize: 15,
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData((prev: any) => ({ ...prev, email: text }))}
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            About You *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 12,
              color: colors.text,
              fontSize: 15,
              minHeight: 120,
              textAlignVertical: 'top',
            }}
            multiline
            value={formData.description}
            onChangeText={(text) => setFormData((prev: any) => ({ ...prev, description: text }))}
            maxLength={1000}
          />
        </View>

        {/* Services */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Services Offered *
          </Text>
          <TouchableOpacity
            onPress={() => setShowServicePicker(true)}
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
              {formData.services.length} services selected
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {formData.services.map((service: string) => (
              <View
                key={service}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text style={{ fontSize: 12, color: '#3B82F6', fontWeight: '600' }}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Locations */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
              Service Locations *
            </Text>
            <TouchableOpacity onPress={addLocation}>
              <Ionicons name="add-circle" size={24} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
          {formData.locations.map((location: any, index: number) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 12,
                    color: colors.text,
                    fontSize: 14,
                  }}
                  placeholder="City *"
                  placeholderTextColor={colors.textSecondary}
                  value={location.city}
                  onChangeText={(text) => updateLocation(index, 'city', text)}
                />
                {formData.locations.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeLocation(index)}
                    style={{
                      backgroundColor: '#EF4444',
                      width: 44,
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="trash" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 12,
                    color: colors.text,
                    fontSize: 14,
                  }}
                  placeholder="State"
                  placeholderTextColor={colors.textSecondary}
                  value={location.state}
                  onChangeText={(text) => updateLocation(index, 'state', text)}
                />
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 12,
                    color: colors.text,
                    fontSize: 14,
                  }}
                  placeholder="Country"
                  placeholderTextColor={colors.textSecondary}
                  value={location.country}
                  onChangeText={(text) => updateLocation(index, 'country', text)}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Pricing *
          </Text>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
                Hourly Rate (₹)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  padding: 14,
                  borderRadius: 12,
                  color: colors.text,
                  fontSize: 15,
                }}
                keyboardType="numeric"
                value={formData.pricing.hourlyRate}
                onChangeText={(text) => setFormData((prev: any) => ({
                  ...prev,
                  pricing: { ...prev.pricing, hourlyRate: text },
                }))}
              />
            </View>
            <View>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
                Per Day Charge (₹)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  padding: 14,
                  borderRadius: 12,
                  color: colors.text,
                  fontSize: 15,
                }}
                keyboardType="numeric"
                value={formData.pricing.perDayCharge}
                onChangeText={(text) => setFormData((prev: any) => ({
                  ...prev,
                  pricing: { ...prev.pricing, perDayCharge: text },
                }))}
              />
            </View>
            <View>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
                Custom Package (₹)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  padding: 14,
                  borderRadius: 12,
                  color: colors.text,
                  fontSize: 15,
                }}
                keyboardType="numeric"
                value={formData.pricing.customPackageCharge}
                onChangeText={(text) => setFormData((prev: any) => ({
                  ...prev,
                  pricing: { ...prev.pricing, customPackageCharge: text },
                }))}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isBuddyLoading}
          style={{
            backgroundColor: '#8B5CF6',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 40,
            opacity: isBuddyLoading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            {isBuddyLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Service Picker Modal */}
      <Modal visible={showServicePicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                Select Services
              </Text>
              <TouchableOpacity onPress={() => setShowServicePicker(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {SERVICES.map((service) => (
                <TouchableOpacity
                  key={service}
                  onPress={() => toggleService(service)}
                  style={{
                    backgroundColor: formData.services.includes(service) ? '#8B5CF6' : colors.background,
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    color: formData.services.includes(service) ? 'white' : colors.text,
                    fontSize: 15,
                    fontWeight: '600',
                  }}>
                    {service}
                  </Text>
                  {formData.services.includes(service) && (
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
