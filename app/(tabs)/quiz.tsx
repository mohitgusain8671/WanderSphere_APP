import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router } from 'expo-router';

export default function QuizScreen() {
  const { colors, isDarkMode } = useTheme();
  const {
    todayQuiz,
    hasAttemptedToday,
    isQuizLoading,
    getTodayQuiz,
    checkTodayAttempt,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    await checkTodayAttempt();
    await getTodayQuiz();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQuiz();
    setRefreshing(false);
  };

  const handleStartQuiz = () => {
    if (hasAttemptedToday) {
      return;
    }
    setShowInstructions(true);
  };

  const handleProceedToQuiz = () => {
    setShowInstructions(false);
    router.push({
      pathname: '/(tabs)/quiz-play',
      params: { quizId: todayQuiz._id },
    } as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.surface }}>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/explore' as any)} 
            style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={{ marginLeft: 8, fontSize: 16, color: colors.text, fontWeight: '600' }}>
              Back to Explore
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
            Daily Quiz
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            Test your travel knowledge and earn points!
          </Text>
        </View>

        {isQuizLoading && !todayQuiz ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading today's quiz...</Text>
          </View>
        ) : !todayQuiz ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
              No quiz available for today.{'\n'}Check back tomorrow!
            </Text>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            {/* Quiz Card */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: '#3B82F6',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                >
                  <Ionicons name="trophy" size={32} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                    {todayQuiz.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                    {new Date(todayQuiz.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {todayQuiz.description && (
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 }}>
                  {todayQuiz.description}
                </Text>
              )}

              {/* Quiz Info */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="help-circle" size={20} color="#3B82F6" />
                  <Text style={{ marginLeft: 6, fontSize: 14, color: colors.text, fontWeight: '600' }}>
                    {todayQuiz.questions.length} Questions
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="star" size={20} color="#F59E0B" />
                  <Text style={{ marginLeft: 6, fontSize: 14, color: colors.text, fontWeight: '600' }}>
                    {todayQuiz.totalPoints} Points
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="time" size={20} color="#10B981" />
                  <Text style={{ marginLeft: 6, fontSize: 14, color: colors.text, fontWeight: '600' }}>
                    {todayQuiz.questions[0]?.timeLimit || 30}s per question
                  </Text>
                </View>
              </View>

              {/* Status */}
              {hasAttemptedToday ? (
                <View
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                    padding: 16,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={{ marginLeft: 12, fontSize: 14, color: '#10B981', fontWeight: '600', flex: 1 }}>
                    You've completed today's quiz!
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleStartQuiz}
                  style={{
                    backgroundColor: '#3B82F6',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                    Start Quiz
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Links */}
            <View style={{ marginTop: 20, gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/quiz-history' as any)}
                style={{
                  backgroundColor: colors.surface,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={24} color="#8B5CF6" />
                  <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: '600', color: colors.text }}>
                    Quiz History
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/leaderboard' as any)}
                style={{
                  backgroundColor: colors.surface,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="trophy-outline" size={24} color="#F59E0B" />
                  <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: '600', color: colors.text }}>
                    Leaderboard
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Instructions Modal */}
      <Modal visible={showInstructions} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: '80%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>Quiz Instructions</Text>
              <TouchableOpacity onPress={() => setShowInstructions(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#3B82F6',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Ionicons name="alert-circle" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      One Attempt Only
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                      You can only attempt the daily quiz once. Make sure you're ready before starting!
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#10B981',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Ionicons name="time" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      Time Limit
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                      Each question has a time limit. Answer quickly to earn bonus points!
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#F59E0B',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Ionicons name="flash" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      Bonus Points
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                      Answer within {todayQuiz?.questions[0]?.bonusTimeThreshold || 10} seconds to earn bonus points!
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#8B5CF6',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Ionicons name="checkmark-done" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      Complete in One Go
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                      Once started, you must complete all questions. You cannot pause or resume.
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleProceedToQuiz}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 24,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                  I Understand, Start Quiz
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
