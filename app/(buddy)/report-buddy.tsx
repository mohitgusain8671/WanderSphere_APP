import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

const REPORT_REASONS = [
  'Unprofessional Behavior',
  'Fraud/Scam',
  'No Show',
  'Overcharging',
  'Safety Concerns',
  'Harassment',
  'Poor Service',
  'Other',
];

export default function ReportBuddyScreen() {
  const { colors } = useTheme();
  const { buddyId, bookingId } = useLocalSearchParams();
  const { reportBuddy, isBuddyLoading } = useAppStore();
  
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [showReasonPicker, setShowReasonPicker] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      Alert.alert('Error', 'Please select a reason');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    if (description.trim().length < 20) {
      Alert.alert('Error', 'Please provide a more detailed description (at least 20 characters)');
      return;
    }

    const reportData = {
      buddyId: buddyId as string,
      bookingId: bookingId as string || undefined,
      reason,
      description: description.trim(),
      evidence: [], // Can be extended to support image uploads
    };

    const result = await reportBuddy(reportData);
    
    if (result.success) {
      Alert.alert(
        'Report Submitted',
        'Thank you for reporting. Our admin team will review this case.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to submit report');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 45 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Report Buddy
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Warning */}
        <View style={{
          backgroundColor: '#FEF3C7',
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
          flexDirection: 'row',
        }}>
          <Ionicons name="warning" size={24} color="#F59E0B" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 4 }}>
              Important
            </Text>
            <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 18 }}>
              False reports may result in action against your account. Please provide accurate information.
            </Text>
          </View>
        </View>

        {/* Reason */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Reason for Report *
          </Text>
          <TouchableOpacity
            onPress={() => setShowReasonPicker(true)}
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ 
              color: reason ? colors.text : colors.textSecondary,
              fontSize: 15,
            }}>
              {reason || 'Select a reason'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Description *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              color: colors.text,
              fontSize: 15,
              minHeight: 200,
              textAlignVertical: 'top',
            }}
            placeholder="Please provide detailed information about the issue..."
            placeholderTextColor={colors.textSecondary}
            multiline
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
          />
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8, textAlign: 'right' }}>
            {description.length}/1000 (minimum 20 characters)
          </Text>
        </View>

        {/* Guidelines */}
        <View style={{
          backgroundColor: colors.surface,
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '600', color: colors.text }}>
              Reporting Guidelines
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20 }}>
            • Be specific about what happened{'\n'}
            • Include dates and times if relevant{'\n'}
            • Mention any witnesses if applicable{'\n'}
            • Provide evidence if available{'\n'}
            • Avoid using offensive language
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isBuddyLoading || !reason || !description.trim()}
          style={{
            backgroundColor: (!reason || !description.trim()) ? colors.textSecondary : '#EF4444',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 40,
            opacity: (isBuddyLoading || !reason || !description.trim()) ? 0.6 : 1,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            {isBuddyLoading ? 'Submitting Report...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Reason Picker Modal */}
      <Modal visible={showReasonPicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                Select Reason
              </Text>
              <TouchableOpacity onPress={() => setShowReasonPicker(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {REPORT_REASONS.map((reasonOption) => (
                <TouchableOpacity
                  key={reasonOption}
                  onPress={() => {
                    setReason(reasonOption);
                    setShowReasonPicker(false);
                  }}
                  style={{
                    backgroundColor: reason === reasonOption ? '#EF4444' : colors.background,
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{
                    color: reason === reasonOption ? 'white' : colors.text,
                    fontSize: 15,
                    fontWeight: reason === reasonOption ? '600' : '400',
                  }}>
                    {reasonOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
