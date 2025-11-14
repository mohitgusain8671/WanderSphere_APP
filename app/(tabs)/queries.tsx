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
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';

export default function QueriesScreen() {
  const { colors } = useTheme();
  const { userQueries, isQueryLoading, getMyQueries, createQuery } = useAppStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  // Form state
  const [formData, setFormData] = useState({
    type: 'other',
    subject: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    await getMyQueries({ sortOrder });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQueries();
    setRefreshing(false);
  };

  const handleSortChange = (order: string) => {
    setSortOrder(order);
    getMyQueries({ sortOrder: order });
  };

  const handleSubmit = async () => {
    if (!formData.subject || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const result = await createQuery(formData);
    if (result.success) {
      Alert.alert('Success', 'Query submitted successfully');
      setShowCreateModal(false);
      setFormData({
        type: 'other',
        subject: '',
        description: '',
        priority: 'medium',
      });
    } else {
      Alert.alert('Error', result.error || 'Failed to submit query');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'resolved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border || 'rgba(0,0,0,0.1)',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>My Queries</Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#3B82F6',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={{ color: 'white', marginLeft: 4, fontWeight: '600' }}>New Query</Text>
          </TouchableOpacity>
        </View>

        {/* Sort Options */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => handleSortChange('desc')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: sortOrder === 'desc' ? '#3B82F6' : colors.background,
            }}
          >
            <Text style={{ color: sortOrder === 'desc' ? 'white' : colors.text, fontSize: 12, fontWeight: '600' }}>
              Latest First
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortChange('asc')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: sortOrder === 'asc' ? '#3B82F6' : colors.background,
            }}
          >
            <Text style={{ color: sortOrder === 'asc' ? 'white' : colors.text, fontSize: 12, fontWeight: '600' }}>
              Oldest First
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Queries List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />}
      >
        {isQueryLoading && !userQueries.length ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading queries...</Text>
          </View>
        ) : userQueries.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>No queries yet</Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
              Submit your first query to get help
            </Text>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 12 }}>
            {userQueries.map((query: any) => (
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

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: colors.background,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.text }}>
                      {query.type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: colors.background,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.text }}>
                      {query.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {query.adminResponse?.message && (
                  <View
                    style={{
                      marginTop: 12,
                      padding: 12,
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: '#3B82F6',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      Admin Response:
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>{query.adminResponse.message}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Query Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
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
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Submit New Query</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Query Type *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {['post', 'comment', 'story', 'account', 'itinerary', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFormData({ ...formData, type })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: formData.type === type ? '#3B82F6' : colors.background,
                    }}
                  >
                    <Text style={{ color: formData.type === type ? 'white' : colors.text, fontSize: 14, fontWeight: '600' }}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Subject *</Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  color: colors.text,
                }}
                placeholder="Brief description of your issue"
                placeholderTextColor={colors.textSecondary}
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
              />

              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Description *</Text>
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
                placeholder="Provide detailed information about your query"
                placeholderTextColor={colors.textSecondary}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
              />

              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Priority</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => setFormData({ ...formData, priority })}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: formData.priority === priority ? '#3B82F6' : colors.background,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: formData.priority === priority ? 'white' : colors.text,
                        fontWeight: '600',
                      }}
                    >
                      {priority.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isQueryLoading}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingVertical: 16,
                  borderRadius: 8,
                  marginTop: 8,
                  opacity: isQueryLoading ? 0.6 : 1,
                }}
              >
                {isQueryLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, fontWeight: '700' }}>
                    Submit Query
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
