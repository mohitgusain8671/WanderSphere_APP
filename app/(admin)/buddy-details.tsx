import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

const STATUS_COLORS: any = {
  pending: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
  banned: '#6B7280',
};

export default function BuddyDetailsScreen() {
  const { colors } = useTheme();
  const { buddyId } = useLocalSearchParams();
  const { user, updateBuddyStatus, banBuddy } = useAppStore();
  
  const [buddy, setBuddy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'ban'>('approve');
  const [reason, setReason] = useState('');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const hasPermission = user?.role === 'super_admin' || 
    (user?.role === 'admin' && user?.permissions?.includes('buddy_management'));

  useEffect(() => {
    loadBuddyDetails();
  }, [buddyId]);

  const loadBuddyDetails = async () => {
    try {
      setLoading(true);
      // Find buddy from adminBuddies in store
      const { adminBuddies, getAllBuddyRegistrations } = useAppStore.getState();
      
      // If not in store, fetch from API
      if (!adminBuddies || adminBuddies.length === 0) {
        await getAllBuddyRegistrations({});
      }
      
      // Find the buddy
      const foundBuddy = useAppStore.getState().adminBuddies.find((b: any) => b._id === buddyId);
      if (foundBuddy) {
        setBuddy(foundBuddy);
      }
    } catch (error) {
      console.error('Error loading buddy details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (actionType === 'reject' && !reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    let result;
    if (actionType === 'ban') {
      result = await banBuddy(buddyId as string, 'ban', reason);
    } else {
      // Convert action type to status: 'approve' -> 'approved', 'reject' -> 'rejected'
      const status = actionType === 'approve' ? 'approved' : 'rejected';
      result = await updateBuddyStatus(buddyId as string, status, reason);
    }

    if (result.success) {
      Alert.alert('Success', `Buddy ${actionType}d successfully`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', result.error || `Failed to ${actionType} buddy`);
    }
    setShowActionModal(false);
    setReason('');
  };

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: colors.background }}>
        <Ionicons name="lock-closed" size={64} color="#EF4444" />
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, textAlign: 'center' }}>
          Access Denied
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!buddy) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>Buddy not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 4 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
          Buddy Details
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Profile Section */}
        <View style={{ padding: 20, backgroundColor: colors.surface, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => {
                if (buddy.profilePicture) {
                  setSelectedImage(buddy.profilePicture);
                  setShowImageViewer(true);
                }
              }}
            >
              <Image
                source={{ uri: buddy.profilePicture || 'https://via.placeholder.com/100' }}
                style={{ width: 80, height: 80, borderRadius: 40, marginRight: 16 }}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                {buddy.buddyName}
              </Text>
              <View style={{ 
                backgroundColor: STATUS_COLORS[buddy.status], 
                paddingHorizontal: 12, 
                paddingVertical: 4, 
                borderRadius: 12, 
                alignSelf: 'flex-start',
                marginTop: 4 
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
                  {buddy.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="mail" size={16} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, color: colors.text }}>{buddy.email}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="call" size={16} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, color: colors.text }}>{buddy.phone}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={{ padding: 20, backgroundColor: colors.surface, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Description
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
            {buddy.description}
          </Text>
        </View>

        {/* Services */}
        <View style={{ padding: 20, backgroundColor: colors.surface, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Services Offered
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {buddy.services?.map((service: string, index: number) => (
              <View key={index} style={{ backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                <Text style={{ color: 'white', fontSize: 12 }}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Locations */}
        <View style={{ padding: 20, backgroundColor: colors.surface, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Service Locations
          </Text>
          {buddy.locations?.map((location: any, index: number) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <Text style={{ color: colors.text }}>
                {location.city}{location.state ? `, ${location.state}` : ''}, {location.country}
              </Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={{ padding: 20, backgroundColor: colors.surface, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Pricing
          </Text>
          <View style={{ gap: 4 }}>
            {buddy.pricing?.hourlyRate > 0 && (
              <Text style={{ color: colors.text }}>Hourly Rate: ₹{buddy.pricing.hourlyRate}</Text>
            )}
            {buddy.pricing?.perDayCharge > 0 && (
              <Text style={{ color: colors.text }}>Per Day: ₹{buddy.pricing.perDayCharge}</Text>
            )}
            {buddy.pricing?.customPackageCharge > 0 && (
              <Text style={{ color: colors.text }}>Custom Package: ₹{buddy.pricing.customPackageCharge}</Text>
            )}
          </View>
        </View>

        {/* Documents */}
        {buddy.documents && buddy.documents.length > 0 && (
          <View style={{ padding: 20, backgroundColor: colors.surface, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              Verification Documents
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {buddy.documents.map((doc: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedImage(doc);
                    setShowImageViewer(true);
                  }}
                  style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: colors.background }}
                >
                  <Image
                    source={{ uri: doc }}
                    style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    resizeMode="cover"
                  />
                  <View style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: 12,
                    padding: 4,
                  }}>
                    <Ionicons name="expand" size={12} color="white" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Rejection Reason */}
        {buddy.status === 'rejected' && buddy.rejectionReason && (
          <View style={{ padding: 20, backgroundColor: '#FEE2E2', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#991B1B', marginBottom: 8 }}>
              Rejection Reason
            </Text>
            <Text style={{ color: '#991B1B' }}>{buddy.rejectionReason}</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {buddy.status === 'pending' && (
        <View style={{ padding: 20, backgroundColor: colors.surface, gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              setActionType('approve');
              setShowActionModal(true);
            }}
            style={{ backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Approve Buddy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setActionType('reject');
              setShowActionModal(true);
            }}
            style={{ backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Reject Buddy</Text>
          </TouchableOpacity>
        </View>
      )}

      {buddy.status === 'approved' && (
        <View style={{ padding: 20, backgroundColor: colors.surface }}>
          <TouchableOpacity
            onPress={() => {
              setActionType('ban');
              setShowActionModal(true);
            }}
            style={{ backgroundColor: '#6B7280', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Ban Buddy</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Modal */}
      <Modal visible={showActionModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
              {actionType === 'approve' ? 'Approve Buddy' : actionType === 'reject' ? 'Reject Buddy' : 'Ban Buddy'}
            </Text>
            
            {(actionType === 'reject' || actionType === 'ban') && (
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  padding: 12,
                  borderRadius: 8,
                  color: colors.text,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  marginBottom: 16,
                }}
                placeholder="Enter reason..."
                placeholderTextColor={colors.textSecondary}
                value={reason}
                onChangeText={setReason}
                multiline
              />
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowActionModal(false);
                  setReason('');
                }}
                style={{ flex: 1, backgroundColor: colors.background, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAction}
                style={{ 
                  flex: 1, 
                  backgroundColor: actionType === 'approve' ? '#10B981' : '#EF4444', 
                  paddingVertical: 14, 
                  borderRadius: 12, 
                  alignItems: 'center' 
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Screen Image Viewer */}
      <Modal visible={showImageViewer} transparent animationType="fade">
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.95)', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setShowImageViewer(false)}
            style={{
              position: 'absolute',
              top: 60,
              right: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: 10,
              zIndex: 10,
            }}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          {/* Image */}
          <Image
            source={{ uri: selectedImage }}
            style={{ width: '100%', height: '80%' }}
            resizeMode="contain"
          />

          {/* Image Info */}
          <View style={{
            position: 'absolute',
            bottom: 40,
            left: 20,
            right: 20,
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 16,
            borderRadius: 12,
          }}>
            <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
              Tap outside or press X to close
            </Text>
          </View>

          {/* Tap to close */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setShowImageViewer(false)}
            activeOpacity={1}
          />
        </View>
      </Modal>
    </View>
  );
}
