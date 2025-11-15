import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import { QUIZ_ROUTES } from '../../utils/constants';

export default function QuizDetailsScreen() {
  const { colors, isDarkMode } = useTheme();
  const { quizId } = useLocalSearchParams();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [questionStats, setQuestionStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadQuizDetails();
  }, []);

  const loadQuizDetails = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      // Get quiz details
      const quizResponse = await api.get(QUIZ_ROUTES.ADMIN_GET(quizId as string));
      if (quizResponse.data.success) {
        setQuiz(quizResponse.data.data.quiz);
      }

      // Get quiz attempts with pagination
      const currentPage = reset ? 1 : page;
      const attemptsResponse = await api.get(`${QUIZ_ROUTES.ADMIN_GET(quizId as string)}/attempts`, {
        params: { page: currentPage, limit: 20 },
      });
      
      if (attemptsResponse.data.success) {
        const newAttempts = attemptsResponse.data.data.attempts;
        if (reset) {
          setAttempts(newAttempts);
        } else {
          setAttempts([...attempts, ...newAttempts]);
        }
        
        // Check if there's more data
        if (newAttempts.length < 20) {
          setHasMore(false);
        }
      }

      // Get question statistics
      const statsResponse = await api.get(`${QUIZ_ROUTES.ADMIN_GET(quizId as string)}/stats`);
      if (statsResponse.data.success) {
        setQuestionStats(statsResponse.data.data.questionStats);
      }

      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Load quiz details error:', error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setHasMore(true);
    await loadQuizDetails(true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      setPage(page + 1);
      loadQuizDetails(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading quiz details...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="alert-circle" size={64} color={colors.textSecondary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>Quiz not found</Text>
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
          {quiz.title}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          {new Date(quiz.date).toLocaleDateString()} • {quiz.questions.length} Questions
        </Text>
      </View>

      <FlatList
        data={attempts}
        keyExtractor={(item, index) => item._id || index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => (
          <View style={{ padding: 20 }}>
            {/* Overall Stats */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
                Overall Statistics
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#3B82F6' }}>
                    {attempts.length}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Attempts</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#10B981' }}>
                    {quiz.totalPoints}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Max Points</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#F59E0B' }}>
                    {attempts.length > 0
                      ? Math.round(attempts.reduce((sum: number, a: any) => sum + a.totalScore, 0) / attempts.length)
                      : 0}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Avg Score</Text>
                </View>
              </View>
            </View>

            {/* Question Statistics */}
            {questionStats.length > 0 && (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
                  Question Statistics
                </Text>
                {questionStats.map((stat: any, index: number) => {
                  const accuracy = stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : 0;
                  return (
                    <View
                      key={index}
                      style={{
                        marginBottom: 16,
                        paddingBottom: 16,
                        borderBottomWidth: index < questionStats.length - 1 ? 1 : 0,
                        borderBottomColor: colors.background,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                        Question {index + 1}
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }} numberOfLines={2}>
                        {quiz.questions[index]?.question}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="people" size={16} color="#3B82F6" />
                          <Text style={{ marginLeft: 4, fontSize: 13, color: colors.text }}>
                            {stat.attempts} attempts
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                          <Text style={{ marginLeft: 4, fontSize: 13, color: colors.text }}>
                            {stat.correct} correct
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="stats-chart" size={16} color="#F59E0B" />
                          <Text style={{ marginLeft: 4, fontSize: 13, color: colors.text }}>
                            {accuracy}% accuracy
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* User Attempts Header */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
              User Attempts
            </Text>
          </View>
        )}
        renderItem={({ item: attempt }) => (
          <View
            style={{
              backgroundColor: colors.surface,
              marginHorizontal: 20,
              marginBottom: 12,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                  {attempt.userId?.firstName} {attempt.userId?.lastName}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  {new Date(attempt.completedAt).toLocaleString()}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#3B82F6' }}>
                  {attempt.totalScore}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>points</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={{ marginLeft: 4, fontSize: 12, color: colors.text }}>
                  {attempt.correctAnswers}/{quiz.questions.length}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time" size={14} color="#F59E0B" />
                <Text style={{ marginLeft: 4, fontSize: 12, color: colors.text }}>
                  {Math.round(attempt.totalTimeTaken / quiz.questions.length)}s avg
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
              No attempts yet
            </Text>
          </View>
        )}
        ListFooterComponent={() =>
          loadingMore && hasMore ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>
                Loading more...
              </Text>
            </View>
          ) : !hasMore && attempts.length > 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                No more attempts to load
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
