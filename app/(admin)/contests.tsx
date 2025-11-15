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
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    questions: [
      {
        type: 'mcq' as 'mcq' | 'task',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10,
        order: 0,
        taskDescription: '',
        taskType: 'text' as 'photo' | 'text' | 'trivia',
      },
    ],
    prize: {
      description: '',
      value: '',
    },
    hasLeaderboard: true,
  });

  const addQuestion = () => {
    setContestData({
      ...contestData,
      questions: [
        ...contestData.questions,
        {
          type: 'mcq' as 'mcq' | 'task',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          points: 10,
          order: contestData.questions.length,
          taskDescription: '',
          taskType: 'text' as 'photo' | 'text' | 'trivia',
        },
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...contestData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setContestData({ ...contestData, questions: newQuestions });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...contestData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setContestData({ ...contestData, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = contestData.questions.filter((_, i) => i !== index);
    setContestData({ ...contestData, questions: newQuestions });
  };

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
              <TouchableOpacity
                key={contest._id}
                onPress={() => {
                  const { router } = require('expo-router');
                  router.push({
                    pathname: '/(admin)/contest-details',
                    params: { contestId: contest._id },
                  } as any);
                }}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                      {contest.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      {new Date(contest.startTime).toLocaleDateString()} - {new Date(contest.endTime).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: contest.status === 'active' ? '#10B981' : contest.status === 'upcoming' ? '#3B82F6' : '#6B7280',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                      {contest.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="help-circle" size={16} color="#3B82F6" />
                    <Text style={{ marginLeft: 4, fontSize: 13, color: colors.text }}>
                      {contest.questions.length} Questions
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="people" size={16} color="#10B981" />
                    <Text style={{ marginLeft: 4, fontSize: 13, color: colors.text }}>
                      {contest.participantCount} Participants
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={{ marginLeft: 4, fontSize: 13, color: colors.text }}>
                      {contest.totalPoints} Points
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteContest(contest._id, contest.title);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#EF4444',
                      paddingVertical: 8,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Delete</Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#3B82F6',
                      paddingVertical: 8,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>View Details</Text>
                  </View>
                </View>
              </TouchableOpacity>
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

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Contest Title *"
                placeholderTextColor={colors.textSecondary}
                value={contestData.title}
                onChangeText={(text) => setContestData({ ...contestData, title: text })}
              />
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Description"
                placeholderTextColor={colors.textSecondary}
                value={contestData.description}
                onChangeText={(text) => setContestData({ ...contestData, description: text })}
                multiline
              />

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }}>
                    Start Time
                  </Text>
                  <TextInput
                    style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, color: colors.text }}
                    placeholder="YYYY-MM-DDTHH:MM"
                    placeholderTextColor={colors.textSecondary}
                    value={contestData.startTime}
                    onChangeText={(text) => setContestData({ ...contestData, startTime: text })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }}>
                    End Time
                  </Text>
                  <TextInput
                    style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, color: colors.text }}
                    placeholder="YYYY-MM-DDTHH:MM"
                    placeholderTextColor={colors.textSecondary}
                    value={contestData.endTime}
                    onChangeText={(text) => setContestData({ ...contestData, endTime: text })}
                  />
                </View>
              </View>

              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Prize Description"
                placeholderTextColor={colors.textSecondary}
                value={contestData.prize.description}
                onChangeText={(text) => setContestData({ ...contestData, prize: { ...contestData.prize, description: text } })}
              />

              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12, marginTop: 8 }}>Questions</Text>

              {contestData.questions.map((q, qIndex) => (
                <View key={qIndex} style={{ backgroundColor: colors.background, padding: 16, borderRadius: 12, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      Question {qIndex + 1}
                    </Text>
                    {contestData.questions.length > 1 && (
                      <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                        <Ionicons name="trash" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <TouchableOpacity
                      onPress={() => updateQuestion(qIndex, 'type', 'mcq')}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 8,
                        backgroundColor: q.type === 'mcq' ? '#3B82F6' : colors.surface,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: q.type === 'mcq' ? 'white' : colors.text, fontSize: 13, fontWeight: '600' }}>
                        MCQ
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => updateQuestion(qIndex, 'type', 'task')}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 8,
                        backgroundColor: q.type === 'task' ? '#8B5CF6' : colors.surface,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: q.type === 'task' ? 'white' : colors.text, fontSize: 13, fontWeight: '600' }}>
                        Task
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 8, marginBottom: 8, color: colors.text }}
                    placeholder="Question text *"
                    placeholderTextColor={colors.textSecondary}
                    value={q.question}
                    onChangeText={(text) => updateQuestion(qIndex, 'question', text)}
                    multiline
                  />

                  {q.type === 'mcq' ? (
                    <>
                      {q.options.map((opt, oIndex) => (
                        <View key={oIndex} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <TouchableOpacity
                            onPress={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: q.correctAnswer === oIndex ? '#10B981' : colors.surface,
                              borderWidth: 2,
                              borderColor: q.correctAnswer === oIndex ? '#10B981' : colors.textSecondary,
                              marginRight: 8,
                            }}
                          />
                          <TextInput
                            style={{ flex: 1, backgroundColor: colors.surface, padding: 10, borderRadius: 8, color: colors.text }}
                            placeholder={`Option ${oIndex + 1} *`}
                            placeholderTextColor={colors.textSecondary}
                            value={opt}
                            onChangeText={(text) => updateOption(qIndex, oIndex, text)}
                          />
                        </View>
                      ))}
                    </>
                  ) : (
                    <>
                      <TextInput
                        style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 8, marginBottom: 8, color: colors.text }}
                        placeholder="Task Description"
                        placeholderTextColor={colors.textSecondary}
                        value={q.taskDescription || ''}
                        onChangeText={(text) => updateQuestion(qIndex, 'taskDescription', text)}
                        multiline
                      />
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => updateQuestion(qIndex, 'taskType', 'photo')}
                          style={{
                            flex: 1,
                            paddingVertical: 8,
                            borderRadius: 8,
                            backgroundColor: q.taskType === 'photo' ? '#8B5CF6' : colors.surface,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: q.taskType === 'photo' ? 'white' : colors.text, fontSize: 12 }}>
                            Photo
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => updateQuestion(qIndex, 'taskType', 'text')}
                          style={{
                            flex: 1,
                            paddingVertical: 8,
                            borderRadius: 8,
                            backgroundColor: q.taskType === 'text' ? '#8B5CF6' : colors.surface,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: q.taskType === 'text' ? 'white' : colors.text, fontSize: 12 }}>
                            Text
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }}>
                      Points
                    </Text>
                    <TextInput
                      style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 8, color: colors.text }}
                      placeholder="10"
                      placeholderTextColor={colors.textSecondary}
                      value={q.points.toString()}
                      onChangeText={(text) => updateQuestion(qIndex, 'points', parseInt(text) || 10)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={addQuestion}
                style={{
                  backgroundColor: colors.background,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: '#3B82F6',
                  borderStyle: 'dashed',
                }}
              >
                <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}>
                  + Add Question
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateContest}
                disabled={isAdminContestLoading}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: isAdminContestLoading ? 0.6 : 1,
                }}
              >
                {isAdminContestLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Create Contest</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
