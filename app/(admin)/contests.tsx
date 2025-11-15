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

export default function AdminContestsManagement() {
  const { colors } = useTheme();
  const {
    user,
    adminContests,
    isAdminContestLoading,
    getAllContests,
    createContest,
    deleteContest,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contestData, setContestData] = useState({
    title: '',
    description: '',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    questions: [
      {
        type: 'mcq',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10,
        order: 0,
      },
    ],
    prize: {
      description: '',
      value: '',
    },
    hasLeaderboard: true,
  });

  const hasPermission = user?.role === 'super_admin' || 
    (user?.role === 'admin' && user?.permissions?.includes('quiz_contest_management'));

  useEffect(() => {
    if (hasPermission) {
      loadContests();
    }
  }, []);

  const loadContests = async () => {
    await getAllContests();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContests();
    setRefreshing(false);
  };

  const handleCreateContest = async () => {
    if (!contestData.title || !contestData.questions[0].question) {
      Alert.alert('Error', 'Please fill in title and at least one question');
      return;
    }

    const result = await createContest(contestData);
    if (result.success) {
      Alert.alert('Success', 'Contest created successfully');
      setShowCreateModal(false);
      loadContests();
    } else {
      Alert.alert('Error', result.error || 'Failed to create contest');
    }
  };

  const handleDeleteContest = (contestId: string, title: string) => {
    Alert.alert(
      'Delete Contest',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteContest(contestId);
            if (result.success) {
              Alert.alert('Success', 'Contest deleted successfully');
              loadContests();
            }
          },
        },
      ]
    );
  };

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <Ionicons name="lock-closed" size={64} color="#EF4444" />
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16 }}>
          Access Denied
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, backgroundColor: colors.surface }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Contest Management</Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={{ backgroundColor: '#3B82F6', padding: 10, borderRadius: 8 }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {isAdminContestLoading && !adminContests.length ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : adminContests.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="trophy-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>No contests yet</Text>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 12 }}>
            {adminContests.map((contest: any) => (
              <View
                key={contest._id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                  {contest.title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                  {contest.status.toUpperCase()} • {contest.participantCount} participants
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteContest(contest._id, contest.title)}
                  style={{
                    backgroundColor: '#EF4444',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Create Contest</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Contest Title *"
                value={contestData.title}
                onChangeText={(text) => setContestData({ ...contestData, title: text })}
              />
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Description"
                value={contestData.description}
                onChangeText={(text) => setContestData({ ...contestData, description: text })}
                multiline
              />
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Prize Description"
                value={contestData.prize.description}
                onChangeText={(text) => setContestData({ ...contestData, prize: { ...contestData.prize, description: text } })}
              />

              <TouchableOpacity
                onPress={handleCreateContest}
                disabled={isAdminContestLoading}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Create Contest</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
