import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

export default function QuizReviewScreen() {
  const { colors, isDarkMode } = useTheme();
  const { attemptId } = useLocalSearchParams();
  const { quizHistory, isQuizLoading } = useAppStore();
  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => {
    // Find the attempt from history
    const foundAttempt = quizHistory.find((a: any) => a._id === attemptId);
    if (foundAttempt) {
      setAttempt(foundAttempt);
    }
  }, [attemptId, quizHistory]);

  if (isQuizLoading || !attempt || !attempt.answers || !Array.isArray(attempt.answers)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>
          {!attempt ? 'Loading quiz review...' : 'No quiz data available'}
        </Text>
      </View>
    );
  }

  const percentage = attempt.answers.length > 0 
    ? Math.round((attempt.correctAnswers / attempt.answers.length) * 100) 
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/quiz-history' as any)} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Quiz Review
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          {attempt.quizId?.title || 'Daily Quiz'} • {new Date(attempt.completedAt).toLocaleDateString()}
        </Text>
      </View>

      <ScrollView>
        {/* Score Summary */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#3B82F6' }}>
                  {attempt.totalScore}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Points</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#10B981' }}>
                  {percentage}%
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Accuracy</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#F59E0B' }}>
                  {attempt.correctAnswers}/{attempt.answers.length}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Correct</Text>
              </View>
            </View>
            {attempt.bonusPoints && attempt.bonusPoints > 0 && (
              <View
                style={{
                  backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                  padding: 12,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="flash" size={20} color="#F59E0B" />
                <Text style={{ marginLeft: 8, fontSize: 14, color: '#F59E0B', fontWeight: '600' }}>
                  +{attempt.bonusPoints} Bonus Points Earned!
                </Text>
              </View>
            )}
          </View>

          {/* Questions Review */}
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
            Questions Review
          </Text>

          {attempt.answers.map((answer: any, index: number) => {
            const question = attempt.quizId?.questions?.[answer.questionIndex ?? index];
            if (!question) return null;
            
            const isCorrect = answer.isCorrect;
            
            // Find the selected option - answer.selectedOption is the option _id
            const userAnswer = question.options?.find((opt: any) => opt._id === answer.selectedOption);
            
            // Find correct answer - it's marked with isCorrect: true
            const correctAnswer = question.options?.find((opt: any) => opt.isCorrect);

            return (
              <View
                key={index}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: isCorrect ? '#10B981' : '#EF4444',
                }}
              >
                {/* Question Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isCorrect ? '#10B981' : '#EF4444',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Ionicons
                        name={isCorrect ? 'checkmark' : 'close'}
                        size={20}
                        color="white"
                      />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 }}>
                      Question {index + 1}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: isCorrect ? '#10B981' : '#EF4444' }}>
                      {answer.pointsAwarded}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>points</Text>
                  </View>
                </View>

                {/* Question Text */}
                <Text style={{ fontSize: 15, color: colors.text, marginBottom: 16, lineHeight: 22 }}>
                  {question?.question}
                </Text>

                {/* Options */}
                <View style={{ gap: 8 }}>
                  {question.options?.map((option: any, optIndex: number) => {
                    const isUserAnswer = option._id === answer.selectedOption;
                    const isCorrectOption = option.isCorrect;
                    
                    // Determine styling based on answer status
                    let backgroundColor = colors.background;
                    let borderColor = isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.5)';
                    let textColor = colors.text;
                    
                    // Correct answer - always show in green
                    if (isCorrectOption) {
                      backgroundColor = isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)';
                      borderColor = '#10B981';
                      textColor = colors.text;
                    }
                    
                    // User's wrong answer - show in red
                    if (isUserAnswer && !isCorrect) {
                      backgroundColor = isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
                      borderColor = '#EF4444';
                      textColor = colors.text;
                    }

                    return (
                      <View
                        key={option._id || optIndex}
                        style={{
                          backgroundColor,
                          borderWidth: 2,
                          borderColor,
                          borderRadius: 8,
                          padding: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 14, color: textColor, fontWeight: '500', flex: 1 }}>
                          {option.text || `Option ${optIndex + 1}`}
                        </Text>
                        
                        {isCorrectOption && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                            <Text style={{ marginLeft: 4, fontSize: 11, color: '#10B981', fontWeight: '700' }}>
                              Correct
                            </Text>
                          </View>
                        )}
                        
                        {isUserAnswer && !isCorrect && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                            <Ionicons name="close-circle" size={18} color="#EF4444" />
                            <Text style={{ marginLeft: 4, fontSize: 11, color: '#EF4444', fontWeight: '700' }}>
                              Your Answer
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Time Taken */}
                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={{ marginLeft: 6, fontSize: 13, color: colors.textSecondary }}>
                    Answered in {answer.timeTaken}s
                    {answer.pointsAwarded > question?.points && ' • Bonus earned!'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
