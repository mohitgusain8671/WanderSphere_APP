import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';

export default function AdminQueriesManagement() {
  const { colors } = useTheme();
  const {
    user,
    adminQueries,
    isAdminQueriesLoading,
    getAllQueries,
    updateQueryStatus,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({
    status: '',
    message: '',
  });
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const [isInitialMount, setIsInitialMount] = React.useState(true);

  // Check permissions
  const hasQueryPermission = user?.role === 'super_admin' || 
    (user?.role === 'admin' && user?.permissions?.includes('query_management'));

  useEffect(() => {
    if (hasQueryPermission) {
      loadQueries();
    }
    setIsInitialMount(false);
  }, []);

  useEffect(() => {
    if (!isInitialMount && hasQueryPermission) {
      handleFilterChange();
    }
  }, [filterStatus, filterType, sortOrder]);

  const loadQueries = async () => {
    const filters: any = { sortOrder };
    if (filterStatus !== 'all') filters.status = filterStatus;
    if (filterType !== 'all') filters.type = filterType;
    
    await getAllQueries(filters);
  };

  const handleFilterChange = async () => {
    setIsFilterLoading(true);
    const filters: any = { sortOrder };
    if (filterStatus !== 'all') filters.status = filterStatus;
    if (filterType !== 'all') filters.type = filterType;
    
    await getAllQueries(filters);
    setIsFilterLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQueries();
    setRefreshing(false);
  };

  const handleOpenQuery = (query: any) => {
    setSelectedQuery(query);
    setResponseData({
      status: query.status,
      message: query.adminResponse?.message || '',
    });
    setShowResponseModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!responseData.status) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    const result = await updateQueryStatus(selectedQuery._id, responseData);
    if (result.success) {
      Alert.alert('Success', 'Query status updated successfully. User has been notified via email.');
      setShowResponseModal(false);
      setSelectedQuery(null);
      loadQueries();
    } else {
      Alert.alert('Error', result.error || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'resolved': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  // Permission check - show message if no permission
  if (!hasQueryPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <View style={{ 
          backgroundColor: colors.surface, 
          padding: 32, 
          borderRadius: 16, 
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: colors.text, 
            marginTop: 16,
            textAlign: 'center',
          }}>
            Access Denied
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: colors.textSecondary, 
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 20,
          }}>
            You don't have permission to manage queries.{'\n'}
            Please contact a Super Admin to grant you{'\n'}
            "query_management" permission.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header & Filters */}
      <View style={{ padding: 16, backgroundColor: colors.surface }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Query Management</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              style={{ backgroundColor: colors.background, padding: 8, borderRadius: 8 }}
            >
              <Ionicons name="filter" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              style={{ backgroundColor: colors.background, padding: 8, borderRadius: 8 }}
            >
              <Ionicons name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.background, padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{adminQueries.length}</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Queries</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.background, padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#F59E0B' }}>
              {adminQueries.filter((q: any) => q.status === 'pending').length}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Pending</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.background, padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#10B981' }}>
              {adminQueries.filter((q: any) => q.status === 'resolved').length}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Resolved</Text>
          </View>
        </View>

        {showFilters && (
          <View style={{ gap: 12 }}>
            {/* Status Filter */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Status</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['all', 'pending', 'in_progress', 'resolved', 'rejected'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setFilterStatus(status)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: filterStatus === status ? '#3B82F6' : colors.background,
                    }}
                  >
                    <Text style={{ color: filterStatus === status ? 'white' : colors.text, fontSize: 12, fontWeight: '600' }}>
                      {status === 'all' ? 'ALL' : status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Type Filter */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['all', 'post', 'comment', 'story', 'account', 'itinerary', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFilterType(type)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: filterType === type ? '#3B82F6' : colors.background,
                    }}
                  >
                    <Text style={{ color: filterType === type ? 'white' : colors.text, fontSize: 12, fontWeight: '600' }}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Queries List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />}
      >
        {(isAdminQueriesLoading || isFilterLoading) && !adminQueries.length ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading queries...</Text>
          </View>
        ) : (isAdminQueriesLoading || isFilterLoading) && adminQueries.length > 0 ? (
          <View style={{ padding: 16 }}>
            <View style={{ 
              backgroundColor: colors.surface, 
              padding: 20, 
              borderRadius: 12, 
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={{ marginTop: 8, color: colors.textSecondary, fontSize: 14 }}>Updating...</Text>
            </View>
            {/* Show existing queries while loading */}
            <View style={{ opacity: 0.5, gap: 12 }}>
              {adminQueries.slice(0, 3).map((query: any) => (
                <View
                  key={query._id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {query.subject}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : adminQueries.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>No queries found</Text>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 12 }}>
            {adminQueries.map((query: any) => (
              <TouchableOpacity
                key={query._id}
                onPress={() => handleOpenQuery(query)}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: getStatusColor(query.status),
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                      {getStatusText(query.status)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {new Date(query.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                  {query.subject}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }} numberOfLines={2}>
                  {query.description}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="person" size={14} color={colors.textSecondary} />
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {query.userId?.firstName} {query.userId?.lastName}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8,
                        backgroundColor: colors.background,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: colors.text }}>
                        {query.type.toUpperCase()}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8,
                        backgroundColor: getPriorityColor(query.priority),
                      }}
                    >
                      <Text style={{ fontSize: 10, color: 'white', fontWeight: '600' }}>
                        {query.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Response Modal */}
      <Modal visible={showResponseModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: '90%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Update Query Status</Text>
              <TouchableOpacity onPress={() => setShowResponseModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedQuery && (
                <>
                  {/* Query Details */}
                  <View style={{ backgroundColor: colors.background, padding: 16, borderRadius: 12, marginBottom: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
                      {selectedQuery.subject}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
                      {selectedQuery.description}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>Type: {selectedQuery.type}</Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>Priority: {selectedQuery.priority}</Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        User: {selectedQuery.userId?.firstName} {selectedQuery.userId?.lastName}
                      </Text>
                    </View>
                  </View>

                  {/* Status Selection */}
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Update Status</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                    {['pending', 'in_progress', 'resolved', 'rejected'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => setResponseData({ ...responseData, status })}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 8,
                          backgroundColor: responseData.status === status ? getStatusColor(status) : colors.background,
                        }}
                      >
                        <Text
                          style={{
                            textAlign: 'center',
                            color: responseData.status === status ? 'white' : colors.text,
                            fontSize: 12,
                            fontWeight: '600',
                          }}
                        >
                          {status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Response Message */}
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Response Message</Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                      color: colors.text,
                      height: 120,
                      textAlignVertical: 'top',
                    }}
                    placeholder="Add a message for the user (optional)..."
                    placeholderTextColor={colors.textSecondary}
                    value={responseData.message}
                    onChangeText={(text) => setResponseData({ ...responseData, message: text })}
                    multiline
                  />

                  {/* Update Button */}
                  <TouchableOpacity
                    onPress={handleUpdateStatus}
                    disabled={isAdminQueriesLoading}
                    style={{
                      backgroundColor: '#3B82F6',
                      paddingVertical: 16,
                      borderRadius: 8,
                      opacity: isAdminQueriesLoading ? 0.6 : 1,
                    }}
                  >
                    {isAdminQueriesLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontWeight: '700' }}>
                        Update Status & Notify User
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
