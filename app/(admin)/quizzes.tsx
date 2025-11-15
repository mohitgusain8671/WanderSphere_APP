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

export default function AdminQuizzesManagement() {
  const { colors } = useTheme();
  const {
    user,
    adminQuizzes,
    isAdminQuizLoading,
    getAllQuizzes,
    createQuiz,
    deleteQuiz,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10,
        timeLimit: 30,
        bonusTimeThreshold: 10,
        bonusPoints: 2,
      },
    ],
  });

  const hasPermission = user?.role === 'super_admin' || 
    (user?.role === 'admin' && user?.permissions?.includes('quiz_contest_management'));

  useEffect(() => {
    if (hasPermission) {
      loadQuizzes();
    }
  }, []);

  const loadQuizzes = async () => {
    await getAllQuizzes();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQuizzes();
    setRefreshing(false);
  };

  const handleCreateQuiz = async () => {
    if (!quizData.title || !quizData.questions[0].question) {
      Alert.alert('Error', 'Please fill in title and at least one question');
      return;
    }

    const result = await createQuiz(quizData);
    if (result.success) {
      Alert.alert('Success', 'Quiz created successfully');
      setShowCreateModal(false);
      resetForm();
      loadQuizzes();
    } else {
      Alert.alert('Error', result.error || 'Failed to create quiz');
    }
  };

  const handleDeleteQuiz = (quizId: string, title: string) => {
    Alert.alert(
      'Delete Quiz',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteQuiz(quizId);
            if (result.success) {
              Alert.alert('Success', 'Quiz deleted successfully');
              loadQuizzes();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete quiz');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setQuizData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          points: 10,
          timeLimit: 30,
          bonusTimeThreshold: 10,
          bonusPoints: 2,
        },
      ],
    });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          points: 10,
          timeLimit: 30,
          bonusTimeThreshold: 10,
          bonusPoints: 2,
        },
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <Ionicons name="lock-closed" size={64} color="#EF4444" />
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, textAlign: 'center' }}>
          Access Denied
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
          You don't have permission to manage quizzes.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: colors.surface }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Quiz Management</Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={{ backgroundColor: '#3B82F6', padding: 10, borderRadius: 8 }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quizzes List */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />}
      >
        {isAdminQuizLoading && !adminQuizzes.length ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : adminQuizzes.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="help-circle-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>No quizzes yet</Text>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 12 }}>
            {adminQuizzes.map((quiz: any) => (
              <View
                key={quiz._id}
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
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                      {quiz.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                      {new Date(quiz.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: quiz.isActive ? '#10B981' : '#6B7280',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                      {quiz.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="help-circle" size={16} color="#3B82F6" />
                    <Text style={{ marginLeft: 4, fontSize: 13, color: colors.text }}>
                      {quiz.questions.length} Questions
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={{ marginLeft: 4, fontSize: 13, color: colors.text }}>
                      {quiz.totalPoints} Points
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteQuiz(quiz._id, quiz.title)}
                  style={{
                    backgroundColor: '#EF4444',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                    Delete Quiz
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Quiz Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Create Quiz</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Quiz Title *"
                placeholderTextColor={colors.textSecondary}
                value={quizData.title}
                onChangeText={(text) => setQuizData({ ...quizData, title: text })}
              />
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 12, color: colors.text }}
                placeholder="Description"
                placeholderTextColor={colors.textSecondary}
                value={quizData.description}
                onChangeText={(text) => setQuizData({ ...quizData, description: text })}
                multiline
              />
              <TextInput
                style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 16, color: colors.text }}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={colors.textSecondary}
                value={quizData.date}
                onChangeText={(text) => setQuizData({ ...quizData, date: text })}
              />

              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>Questions</Text>

              {quizData.questions.map((q, qIndex) => (
                <View key={qIndex} style={{ backgroundColor: colors.background, padding: 16, borderRadius: 12, marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                    Question {qIndex + 1}
                  </Text>
                  <TextInput
                    style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 8, marginBottom: 8, color: colors.text }}
                    placeholder="Question text *"
                    placeholderTextColor={colors.textSecondary}
                    value={q.question}
                    onChangeText={(text) => updateQuestion(qIndex, 'question', text)}
                    multiline
                  />

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

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TextInput
                      style={{ flex: 1, backgroundColor: colors.surface, padding: 10, borderRadius: 8, color: colors.text }}
                      placeholder="Points"
                      placeholderTextColor={colors.textSecondary}
                      value={q.points.toString()}
                      onChangeText={(text) => updateQuestion(qIndex, 'points', parseInt(text) || 10)}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={{ flex: 1, backgroundColor: colors.surface, padding: 10, borderRadius: 8, color: colors.text }}
                      placeholder="Time (s)"
                      placeholderTextColor={colors.textSecondary}
                      value={q.timeLimit.toString()}
                      onChangeText={(text) => updateQuestion(qIndex, 'timeLimit', parseInt(text) || 30)}
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
                onPress={handleCreateQuiz}
                disabled={isAdminQuizLoading}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: isAdminQuizLoading ? 0.6 : 1,
                }}
              >
                {isAdminQuizLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                    Create Quiz
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
