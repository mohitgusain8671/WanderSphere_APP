import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router } from 'expo-router';

const STATUS_COLORS: any = {
  pending: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
  banned: '#6B7280',
};

export default function BuddyManagementScreen() {
  const { colors, isDarkMode } = useTheme();
  const {
    user,
    adminBuddies,
    isAdminBuddiesLoading,
    buddyStatistics,
    getAllBuddyRegistrations,
    updateBuddyStatus,
    banBuddy,
    getBuddyStatistics,
  } = useAppStore();

  const hasPermission = user?.role === 'super_admin' || 
    (user?.role === 'admin' && user?.permissions?.includes('buddy_management'));

  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'ban' | 'unban'>('approve');
  const [reason, setReason] = useState('');

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
    await getAllBuddyRegistrations(filters);
    await getBuddyStatistics();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAction = (buddy: any, action: 'approve' | 'reject' | 'ban' | 'unban') => {
    setSelectedBuddy(buddy);
    setActionType(action);
    setReason('');
    setShowActionModal(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedBuddy) return;

    if ((actionType === 'reject' || actionType === 'ban') && !reason.trim()) {
      Alert.alert('Error', 'Please provide a reason');
      return;
    }

    let result;
    if (actionType === 'approve' || actionType === 'reject') {
      result = await updateBuddyStatus(
        selectedBuddy._id,
        actionType === 'approve' ? 'approved' : 'rejected',
        reason.trim()
      );
    } else {
      result = await banBuddy(
        selectedBuddy._id,
        actionType === 'ban' ? 'ban' : 'unban',
        reason.trim()
      );
    }

    if (result.success) {
      setShowActionModal(false);
      Alert.alert('Success', `Buddy ${actionType}ed successfully`);
      loadData();
    } else {
      Alert.alert('Error', result.error || `Failed to ${actionType} buddy`);
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'banned', label: 'Banned' },
  ];

  const filteredBuddies = activeTab === 'all'
    ? adminBuddies
    : adminBuddies.filter((b: any) => b.status === activeTab);

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: colors.background }}>
        <Ionicons name="lock-closed" size={64} color="#EF4444" />
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, textAlign: 'center' }}>
          Access Denied
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
          You don't have permission to manage local buddies.
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
            Buddy Management
          </Text>
        </View>

        {/* Statistics */}
        {buddyStatistics && (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#3B82F6' }}>
                {buddyStatistics.totalBuddies}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Total</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#F59E0B' }}>
                {buddyStatistics.pendingBuddies}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Pending</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#10B981' }}>
                {buddyStatistics.approvedBuddies}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Active</Text>
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
                  backgroundColor: activeTab === tab.key ? '#8B5CF6' : colors.background,
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

      {/* Buddies List */}
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#8B5CF6']} />
        }
      >
        {isAdminBuddiesLoading && !refreshing ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading buddies...</Text>
          </View>
        ) : filteredBuddies.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
              No buddies found
            </Text>
          </View>
        ) : (
          filteredBuddies.map((buddy: any) => (
            <TouchableOpacity
              key={buddy._id}
              onPress={() => router.push(`/(admin)/buddy-details?buddyId=${buddy._id}` as any)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: STATUS_COLORS[buddy.status],
              }}
            >
              {/* Buddy Header */}
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <Image
                  source={{ uri: buddy.profilePicture || buddy.userId?.profilePicture }}
                  style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.background }}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {buddy.buddyName}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                    {buddy.email}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <View style={{
                      backgroundColor: STATUS_COLORS[buddy.status],
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                    }}>
                      <Text style={{ fontSize: 11, color: 'white', fontWeight: '600', textTransform: 'capitalize' }}>
                        {buddy.status}
                      </Text>
                    </View>
                    {buddy.rating.count > 0 && (
                      <>
                        <Ionicons name="star" size={12} color="#F59E0B" style={{ marginLeft: 8 }} />
                        <Text style={{ marginLeft: 2, fontSize: 12, color: colors.text }}>
                          {buddy.rating.average.toFixed(1)} ({buddy.rating.count})
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    {new Date(buddy.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                    {buddy.completedBookings} bookings
                  </Text>
                </View>
              </View>

              {/* Services */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {buddy.services.slice(0, 3).map((service: string, index: number) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: '#8B5CF6', fontWeight: '600' }}>
                      {service}
                    </Text>
                  </View>
                ))}
                {buddy.services.length > 3 && (
                  <View style={{
                    backgroundColor: colors.background,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}>
                      +{buddy.services.length - 3}
                    </Text>
                  </View>
                )}
              </View>

              {/* Rejection Reason */}
              {buddy.rejectionReason && (
                <View style={{
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                    Reason:
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {buddy.rejectionReason}
                  </Text>
                </View>
              )}

              {/* Tap to view details */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#3B82F6', fontWeight: '600' }}>
                  Tap to view details
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#3B82F6" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Action Modal */}
      <Modal visible={showActionModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, textTransform: 'capitalize' }}>
                {actionType} Buddy
              </Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedBuddy && (
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                  {selectedBuddy.buddyName}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                  {selectedBuddy.email}
                </Text>
              </View>
            )}

            {(actionType === 'reject' || actionType === 'ban') && (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                  Reason *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    padding: 14,
                    borderRadius: 12,
                    color: colors.text,
                    fontSize: 15,
                    minHeight: 100,
                    textAlignVertical: 'top',
                    marginBottom: 20,
                  }}
                  placeholder={`Explain why you are ${actionType}ing this buddy...`}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  value={reason}
                  onChangeText={setReason}
                  maxLength={500}
                />
              </>
            )}

            <TouchableOpacity
              onPress={handleSubmitAction}
              disabled={isAdminBuddiesLoading}
              style={{
                backgroundColor: actionType === 'approve' || actionType === 'unban' ? '#10B981' : '#EF4444',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                opacity: isAdminBuddiesLoading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', textTransform: 'capitalize' }}>
                {isAdminBuddiesLoading ? 'Processing...' : `Confirm ${actionType}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
