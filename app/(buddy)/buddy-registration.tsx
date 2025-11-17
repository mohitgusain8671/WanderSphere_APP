import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
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

export default function BuddyRegistrationScreen() {
  const { colors, isDarkMode } = useTheme();
  const { registerAsBuddy, uploadBuddyDocuments, uploadBuddyProfilePicture, isBuddyLoading, user } = useAppStore();

  const [formData, setFormData] = useState({
    buddyName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    phone: '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || '',
    description: '',
    documents: [] as any[],
    services: [] as string[],
    locations: [{ city: '', state: '', country: 'India' }],
    pricing: {
      hourlyRate: '',
      perDayCharge: '',
      customPackageCharge: '',
    },
  });

  const [showServicePicker, setShowServicePicker] = useState(false);

  const pickImage = async (type: 'profile' | 'document') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: type === 'profile',
      aspect: type === 'profile' ? [1, 1] : undefined,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'profile') {
        setFormData(prev => ({ ...prev, profilePicture: result.assets[0].uri }));
      } else {
        setFormData(prev => ({
          ...prev,
          documents: [...prev.documents, result.assets[0].uri],
        }));
      }
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const addLocation = () => {
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, { city: '', state: '', country: 'India' }],
    }));
  };

  const updateLocation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map((loc, i) =>
        i === index ? { ...loc, [field]: value } : loc
      ),
    }));
  };

  const removeLocation = (index: number) => {
    if (formData.locations.length > 1) {
      setFormData(prev => ({
        ...prev,
        locations: prev.locations.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    if (!formData.buddyName.trim()) {
      Alert.alert('Error', 'Please enter your buddy name');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!formData.description.trim() || formData.description.length < 50) {
      Alert.alert('Error', 'Please provide a detailed description (at least 50 characters)');
      return false;
    }
    if (formData.services.length === 0) {
      Alert.alert('Error', 'Please select at least one service');
      return false;
    }
    if (!formData.locations[0].city.trim()) {
      Alert.alert('Error', 'Please add at least one location');
      return false;
    }
    if (!formData.pricing.hourlyRate && !formData.pricing.perDayCharge) {
      Alert.alert('Error', 'Please set at least hourly rate or per day charge');
      return false;
    }
    if (formData.documents.length === 0) {
      Alert.alert('Error', 'Please upload at least one verification document for admin review');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let profilePictureUrl = formData.profilePicture;
      let documentUrls: string[] = [];

      // Upload profile picture if it's a local file
      if (formData.profilePicture && !formData.profilePicture.startsWith('http')) {
        const profileResult = await uploadBuddyProfilePicture(formData.profilePicture);
        if (profileResult.success) {
          profilePictureUrl = profileResult.data.url;
        }
      }

      // Upload documents if any
      if (formData.documents.length > 0) {
        const documentsToUpload = formData.documents.filter(doc => 
          typeof doc === 'object' && doc.uri && !doc.uri.startsWith('http')
        );
        
        if (documentsToUpload.length > 0) {
          const documentsResult = await uploadBuddyDocuments(documentsToUpload);
          if (documentsResult.success) {
            documentUrls = documentsResult.data.files.map((file: any) => file.url);
          }
        }
        
        // Add existing URLs (if any)
        const existingUrls = formData.documents
          .filter(doc => typeof doc === 'string' || (doc.uri && doc.uri.startsWith('http')))
          .map(doc => typeof doc === 'string' ? doc : doc.uri);
        
        documentUrls = [...documentUrls, ...existingUrls];
      }

      const registrationData = {
        ...formData,
        profilePicture: profilePictureUrl,
        documents: documentUrls,
        pricing: {
          hourlyRate: parseFloat(formData.pricing.hourlyRate) || 0,
          perDayCharge: parseFloat(formData.pricing.perDayCharge) || 0,
          customPackageCharge: parseFloat(formData.pricing.customPackageCharge) || 0,
        },
        locations: formData.locations.filter(loc => loc.city.trim()),
      };

      const result = await registerAsBuddy(registrationData);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Your buddy registration has been submitted. Our admin team will review it soon.',
          [{ text: 'OK', onPress: () => router.push('/(buddy)/buddy-dashboard' as any) }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit registration');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to submit registration. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Buddy Registration
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Profile Picture */}
        <View style={{ marginBottom: 24, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => pickImage('profile')}>
            {formData.profilePicture ? (
              <Image
                source={{ uri: formData.profilePicture }}
                style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.surface }}
              />
            ) : (
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name="camera" size={40} color={colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>
            Tap to upload profile picture
          </Text>
        </View>

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
            placeholder="Enter your buddy name"
            placeholderTextColor={colors.textSecondary}
            value={formData.buddyName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, buddyName: text }))}
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
            placeholder="Enter phone number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
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
            placeholder="Enter email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            About You * (min 50 characters)
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
            placeholder="Tell travelers about yourself, your experience, and what makes you a great local buddy..."
            placeholderTextColor={colors.textSecondary}
            multiline
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            maxLength={1000}
          />
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'right' }}>
            {formData.description.length}/1000
          </Text>
        </View>

        {/* Documents */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
            Verification Documents <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8, fontStyle: 'italic' }}>
            Required for admin verification. Upload ID, licenses, or certificates.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {formData.documents.map((doc, index) => (
              <View key={index} style={{ position: 'relative' }}>
                <Image
                  source={{ uri: doc }}
                  style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: colors.surface }}
                />
                <TouchableOpacity
                  onPress={() => removeDocument(index)}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: '#EF4444',
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => pickImage('document')}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                backgroundColor: colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: colors.border,
                borderStyle: 'dashed',
              }}
            >
              <Ionicons name="add" size={32} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Services */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Services Offered * (Select at least one)
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
            <Text style={{ color: formData.services.length > 0 ? colors.text : colors.textSecondary, fontSize: 15 }}>
              {formData.services.length > 0 ? `${formData.services.length} services selected` : 'Select services'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {formData.services.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {formData.services.map((service) => (
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
          )}
        </View>

        {/* Locations */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
              Service Locations *
            </Text>
            <TouchableOpacity onPress={addLocation}>
              <Ionicons name="add-circle" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
            Where you provide services or where you are present
          </Text>
          {formData.locations.map((location, index) => (
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
            Pricing * (Set at least one)
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
                placeholder="e.g., 500"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={formData.pricing.hourlyRate}
                onChangeText={(text) => setFormData(prev => ({
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
                placeholder="e.g., 3000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={formData.pricing.perDayCharge}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing, perDayCharge: text },
                }))}
              />
            </View>
            <View>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
                Custom Package (₹) - Optional
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  padding: 14,
                  borderRadius: 12,
                  color: colors.text,
                  fontSize: 15,
                }}
                placeholder="e.g., 10000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={formData.pricing.customPackageCharge}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing, customPackageCharge: text },
                }))}
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
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
            {isBuddyLoading ? 'Submitting...' : 'Submit Registration'}
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
                    backgroundColor: formData.services.includes(service) ? '#3B82F6' : colors.background,
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
