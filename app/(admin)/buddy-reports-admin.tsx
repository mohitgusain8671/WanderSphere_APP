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
  under_review: '#3B82F6',
  resolved: '#10B981',
  dismissed: '#6B7280',
};

const ACTION_OPTIONS = [
  { value: 'none', label: 'No Action' },
  { value: 'warning', label: 'Warning' },
  { value: 'temporary_ban', label: 'Temporary Ban' },
  { value: 'permanent_ban', label: 'Permanent Ban' },
];

export default function BuddyReportsAdminScreen() {
  const { colors } = useTheme();
  const {
    user,
    adminReports,
    isAdminReportsLoading,
    getAllReports,
    updateReportStatus,
    buddyStatistics,
    getBuddyStatistics,
  } = useAppStore();

  const hasPermission = user?.role === 'super_admin' || 
    (user?.role === 'admin' && user?.permissions?.includes('buddy_management'));

  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reviewData, setReviewData] = useState({
    status: 'under_review',
    adminNotes: '',
    actionTaken: 'none',
  });

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
    await getAllReports(filters);
    await getBuddyStatistics();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleReviewReport = (report: any) => {
    setSelectedReport(report);
    setReviewData({
      status: report.status === 'pending' ? 'under_review' : report.status,
      adminNotes: report.adminNotes || '',
      actionTaken: report.actionTaken || 'none',
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReport) return;

    const result = await updateReportStatus(
      selectedReport._id,
      reviewData.status,
      reviewData.adminNotes,
      reviewData.actionTaken
    );

    if (result.success) {
      setShowReviewModal(false);
      Alert.alert('Success', 'Report updated successfully');
      loadData();
    } else {
      Alert.alert('Error', result.error || 'Failed to update report');
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'dismissed', label: 'Dismissed' },
  ];

  const filteredReports = activeTab === 'all'
    ? adminReports
    : adminReports.filter((r: any) => r.status === activeTab);

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: colors.background }}>
        <Ionicons name="lock-closed" size={64} color="#EF4444" />
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, textAlign: 'center' }}>
          Access Denied
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
          You don't have permission to view buddy reports.
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
            Buddy Reports
          </Text>
        </View>

        {/* Statistics */}
        {buddyStatistics && (
          <View style={{
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#EF4444',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: 'white' }}>
                {buddyStatistics.pendingReports}
              </Text>
            </View>
            <View style={{ marginLeft: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                Pending Reports
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Require immediate attention
              </Text>
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
                  backgroundColor: activeTab === tab.key ? '#EF4444' : colors.background,
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

      {/* Reports List */}
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#EF4444']} />
        }
      >
        {isAdminReportsLoading && !refreshing ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading reports...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="flag-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
              No reports found
            </Text>
          </View>
        ) : (
          filteredReports.map((report: any) => (
            <TouchableOpacity
              key={report._id}
              onPress={() => handleReviewReport(report)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: STATUS_COLORS[report.status],
              }}
            >
              {/* Report Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{
                  backgroundColor: STATUS_COLORS[report.status],
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{ fontSize: 11, color: 'white', fontWeight: '700', textTransform: 'capitalize' }}>
                    {report.status.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {/* Reporter Info */}
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  Reported By
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: report.reportedBy?.profilePicture }}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface }}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {report.reportedBy?.email}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Reported Buddy */}
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  Reported Buddy
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: report.buddyId?.profilePicture }}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface }}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      {report.buddyId?.buddyName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {report.buddyId?.email}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Reason */}
              <View style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#EF4444', marginBottom: 4 }}>
                  {report.reason}
                </Text>
                <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18 }}>
                  {report.description}
                </Text>
              </View>

              {/* Action Taken */}
              {report.actionTaken && report.actionTaken !== 'none' && (
                <View style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                    Action Taken:
                  </Text>
                  <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '600', textTransform: 'capitalize' }}>
                    {report.actionTaken.replace('_', ' ')}
                  </Text>
                </View>
              )}

              {/* Admin Notes */}
              {report.adminNotes && (
                <View style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 12,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                    Admin Notes:
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    {report.adminNotes}
                  </Text>
                </View>
              )}

              {/* Review Button */}
              {report.status !== 'resolved' && report.status !== 'dismissed' && (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#3B82F6',
                    padding: 12,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
                    Review Report
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                Review Report
              </Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Status */}
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                Status
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                {['under_review', 'resolved', 'dismissed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setReviewData(prev => ({ ...prev, status }))}
                    style={{
                      flex: 1,
                      backgroundColor: reviewData.status === status ? '#3B82F6' : colors.background,
                      padding: 12,
                      borderRadius: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      color: reviewData.status === status ? 'white' : colors.text,
                      fontWeight: '600',
                      fontSize: 12,
                      textTransform: 'capitalize',
                    }}>
                      {status.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action */}
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                Action to Take
              </Text>
              <View style={{ gap: 8, marginBottom: 20 }}>
                {ACTION_OPTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.value}
                    onPress={() => setReviewData(prev => ({ ...prev, actionTaken: action.value }))}
                    style={{
                      backgroundColor: reviewData.actionTaken === action.value ? '#EF4444' : colors.background,
                      padding: 14,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{
                      color: reviewData.actionTaken === action.value ? 'white' : colors.text,
                      fontWeight: '600',
                      fontSize: 14,
                    }}>
                      {action.label}
                    </Text>
                    {reviewData.actionTaken === action.value && (
                      <Ionicons name="checkmark-circle" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Admin Notes */}
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                Admin Notes
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
                placeholder="Add notes about your decision..."
                placeholderTextColor={colors.textSecondary}
                multiline
                value={reviewData.adminNotes}
                onChangeText={(text) => setReviewData(prev => ({ ...prev, adminNotes: text }))}
                maxLength={1000}
              />

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitReview}
                disabled={isAdminReportsLoading}
                style={{
                  backgroundColor: '#3B82F6',
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginBottom: 20,
                  opacity: isAdminReportsLoading ? 0.6 : 1,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                  {isAdminReportsLoading ? 'Updating...' : 'Update Report'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
