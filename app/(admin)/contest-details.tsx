import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import { CONTEST_ROUTES } from '../../utils/constants';

export default function ContestDetailsScreen() {
  const { colors, isDarkMode } = useTheme();
  const { contestId } = useLocalSearchParams();
  
  const [contest, setContest] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [questionStats, setQuestionStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewData, setReviewData] = useState({ points: 0, comment: '' });

  useEffect(() => {
    loadContestDetails();
  }, []);

  const loadContestDetails = async (reset = false) => {
    try {
      if (reset) setLoading(true);

      // Get contest details
      const contestResponse = await api.get(CONTEST_ROUTES.ADMIN_GET(contestId as string));
      if (contestResponse.data.success) {
        setContest(contestResponse.data.data.contest);
      }

      // Get submissions
      const submissionsResponse = await api.get(CONTEST_ROUTES.ADMIN_SUBMISSIONS(contestId as string));
      if (submissionsResponse.data.success) {
        setSubmissions(submissionsResponse.data.data.submissions);
      }

      // Get question statistics
      const statsResponse = await api.get(CONTEST_ROUTES.ADMIN_STATS(contestId as string));
      if (statsResponse.data.success) {
        setQuestionStats(statsResponse.data.data.questionStats);
      }

      setLoading(false);
    } catch (error) {
      console.error('Load contest details error:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContestDetails(true);
    setRefreshing(false);
  };

  const handleQuestionClick = (question: any, index: number) => {
    setSelectedQuestion({ ...question, index });
    setShowQuestionModal(true);
  };

  const handleReviewTask = (submission: any, questionIndex: number) => {
    const answer = submission.answers.find((a: any) => a.questionIndex === questionIndex);
    setSelectedSubmission({ ...submission, answer, questionIndex });
    setReviewData({ 
      points: answer?.pointsEarned || 0, 
      comment: answer?.adminComment || '' 
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    try {
      const response = await api.put(
        CONTEST_ROUTES.ADMIN_REVIEW(contestId as string, selectedSubmission._id),
        {
          questionIndex: selectedSubmission.questionIndex,
          points: reviewData.points,
          comment: reviewData.comment,
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Review submitted successfully');
        setShowReviewModal(false);
        loadContestDetails();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading contest details...</Text>
      </View>
    );
  }

  if (!contest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="alert-circle" size={64} color={colors.textSecondary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>Contest not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
          {contest.title}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          {new Date(contest.startTime).toLocaleDateString()} - {new Date(contest.endTime).toLocaleDateString()}
        </Text>
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(item) => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />
        }
        renderItem={() => (
          <View style={{ padding: 20 }}>
            {/* Overall Stats */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
                Overall Statistics
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#3B82F6' }}>
                    {submissions.length}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Submissions</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#10B981' }}>
                    {contest.totalPoints}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Max Points</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#F59E0B' }}>
                    {submissions.length > 0
                      ? Math.round(submissions.reduce((sum: number, s: any) => sum + s.totalScore, 0) / submissions.length)
                      : 0}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Avg Score</Text>
                </View>
              </View>
            </View>

            {/* Questions List */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
                Questions
              </Text>
              {contest.questions.map((question: any, index: number) => {
                const stat = questionStats[index] || {};
                const accuracy = stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : 0;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleQuestionClick(question, index)}
                    style={{
                      marginBottom: 16,
                      paddingBottom: 16,
                      borderBottomWidth: index < contest.questions.length - 1 ? 1 : 0,
                      borderBottomColor: colors.background,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: question.type === 'mcq' ? '#3B82F6' : '#8B5CF6',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name={question.type === 'mcq' ? 'help-circle' : 'create'}
                          size={18}
                          color="white"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                          Question {index + 1} • {question.type.toUpperCase()}
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                          {question.question}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12, marginLeft: 44 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="people" size={14} color="#3B82F6" />
                        <Text style={{ marginLeft: 4, fontSize: 12, color: colors.text }}>
                          {stat.attempts || 0} attempts
                        </Text>
                      </View>
                      {question.type === 'mcq' && (
                        <>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                            <Text style={{ marginLeft: 4, fontSize: 12, color: colors.text }}>
                              {stat.correct || 0} correct
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="stats-chart" size={14} color="#F59E0B" />
                            <Text style={{ marginLeft: 4, fontSize: 12, color: colors.text }}>
                              {accuracy}%
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Submissions List */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
              User Submissions
            </Text>
            {submissions.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
                  No submissions yet
                </Text>
              </View>
            ) : (
              submissions.map((submission: any) => (
                <View
                  key={submission._id}
                  style={{
                    backgroundColor: colors.surface,
                    marginBottom: 12,
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                        {submission.userId?.firstName} {submission.userId?.lastName}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                        {new Date(submission.submittedAt).toLocaleString()}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: '#3B82F6' }}>
                        {submission.totalScore}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>points</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {submission.answers.filter((a: any) => a.type === 'mcq').length > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={{ marginLeft: 4, fontSize: 12, color: colors.text }}>
                          {submission.answers.filter((a: any) => a.type === 'mcq' && a.isCorrect).length}/
                          {submission.answers.filter((a: any) => a.type === 'mcq').length} MCQ
                        </Text>
                      </View>
                    )}
                    {submission.answers.filter((a: any) => a.type === 'task').length > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="create" size={14} color="#8B5CF6" />
                        <Text style={{ marginLeft: 4, fontSize: 12, color: colors.text }}>
                          {submission.answers.filter((a: any) => a.type === 'task').length} tasks
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      />

      {/* Question Detail Modal */}
      <Modal visible={showQuestionModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                Question {selectedQuestion?.index + 1}
              </Text>
              <TouchableOpacity onPress={() => setShowQuestionModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[{ key: 'question' }]}
              keyExtractor={(item) => item.key}
              renderItem={() => (
                <View>
                  <Text style={{ fontSize: 16, color: colors.text, marginBottom: 16, lineHeight: 24 }}>
                    {selectedQuestion?.question}
                  </Text>

                  {selectedQuestion?.type === 'mcq' ? (
                    <View style={{ marginBottom: 20 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                        Options:
                      </Text>
                      {selectedQuestion.options.map((option: string, index: number) => (
                        <View
                          key={index}
                          style={{
                            backgroundColor: index === selectedQuestion.correctAnswer
                              ? isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                              : colors.background,
                            borderWidth: 2,
                            borderColor: index === selectedQuestion.correctAnswer ? '#10B981' : colors.background,
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 14, color: colors.text, flex: 1 }}>
                            {option}
                          </Text>
                          {index === selectedQuestion.correctAnswer && (
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={{ marginBottom: 20 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                        Task Type: {selectedQuestion?.taskType}
                      </Text>
                      {selectedQuestion?.taskDescription && (
                        <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
                          {selectedQuestion.taskDescription}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* User Responses for this question */}
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
                    User Responses
                  </Text>
                  {submissions.map((submission: any) => {
                    const answer = submission.answers.find((a: any) => a.questionIndex === selectedQuestion?.index);
                    if (!answer) return null;

                    return (
                      <View
                        key={submission._id}
                        style={{
                          backgroundColor: colors.background,
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 12,
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                            {submission.userId?.firstName} {submission.userId?.lastName}
                          </Text>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: answer.isCorrect ? '#10B981' : '#3B82F6' }}>
                            {answer.pointsEarned} pts
                          </Text>
                        </View>

                        {selectedQuestion?.type === 'mcq' ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons
                              name={answer.isCorrect ? 'checkmark-circle' : 'close-circle'}
                              size={18}
                              color={answer.isCorrect ? '#10B981' : '#EF4444'}
                            />
                            <Text style={{ marginLeft: 8, fontSize: 13, color: colors.text }}>
                              Selected: {selectedQuestion.options[answer.selectedAnswer]}
                            </Text>
                          </View>
                        ) : (
                          <>
                            {answer.taskSubmission && (
                              <View style={{ marginTop: 8 }}>
                                {answer.taskSubmissionType === 'photo' ? (
                                  <Image
                                    source={{ uri: answer.taskSubmission }}
                                    style={{ width: '100%', height: 200, borderRadius: 8 }}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <Text style={{ fontSize: 13, color: colors.text, lineHeight: 20 }}>
                                    {answer.taskSubmission}
                                  </Text>
                                )}
                              </View>
                            )}
                            <TouchableOpacity
                              onPress={() => handleReviewTask(submission, selectedQuestion.index)}
                              style={{
                                backgroundColor: '#8B5CF6',
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginTop: 12,
                              }}
                            >
                              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                                {answer.pointsEarned > 0 ? 'Update Review' : 'Review & Award Points'}
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Review Task Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                Review Task
              </Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              {selectedSubmission?.userId?.firstName} {selectedSubmission?.userId?.lastName}
            </Text>

            {selectedSubmission?.answer?.taskSubmission && (
              <View style={{ marginBottom: 16 }}>
                {selectedSubmission.answer.taskSubmissionType === 'photo' ? (
                  <Image
                    source={{ uri: selectedSubmission.answer.taskSubmission }}
                    style={{ width: '100%', height: 250, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ backgroundColor: colors.background, padding: 16, borderRadius: 12 }}>
                    <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
                      {selectedSubmission.answer.taskSubmission}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              Award Points (Max: {contest?.questions[selectedSubmission?.questionIndex]?.points})
            </Text>
            <TextInput
              style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 16, color: colors.text }}
              placeholder="Points"
              placeholderTextColor={colors.textSecondary}
              value={reviewData.points.toString()}
              onChangeText={(text) => setReviewData({ ...reviewData, points: parseInt(text) || 0 })}
              keyboardType="numeric"
            />

            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              Comment (Optional)
            </Text>
            <TextInput
              style={{ backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 16, color: colors.text, minHeight: 80 }}
              placeholder="Add feedback for the user..."
              placeholderTextColor={colors.textSecondary}
              value={reviewData.comment}
              onChangeText={(text) => setReviewData({ ...reviewData, comment: text })}
              multiline
            />

            <TouchableOpacity
              onPress={handleSubmitReview}
              style={{
                backgroundColor: '#8B5CF6',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                Submit Review
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
