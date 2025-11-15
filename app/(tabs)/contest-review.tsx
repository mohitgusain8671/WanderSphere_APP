import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

export default function ContestReviewScreen() {
  const { colors, isDarkMode } = useTheme();
  const { submissionId } = useLocalSearchParams();
  const { myContests, isContestLoading, getMyContestHistory } = useAppStore();
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    if (myContests.length > 0) {
      const foundSubmission = myContests.find((s: any) => s._id === submissionId);
      if (foundSubmission) {
        setSubmission(foundSubmission);
      }
    }
  }, [submissionId, myContests]);

  const loadSubmissions = async () => {
    await getMyContestHistory();
  };

  if (isContestLoading || !submission || !submission.answers || !Array.isArray(submission.answers)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>
          {!submission ? 'Loading contest review...' : 'No contest data available'}
        </Text>
      </View>
    );
  }

  const mcqAnswers = submission.answers.filter((a: any) => a.questionType === 'mcq');
  const taskAnswers = submission.answers.filter((a: any) => a.questionType === 'task');
  const correctMcq = mcqAnswers.filter((a: any) => a.isCorrect).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/contests' as any)} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Contest Review
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          {submission.contestId?.title || 'Contest'} • {new Date(submission.submittedAt).toLocaleDateString()}
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
                  {submission.totalScore}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Points</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#10B981' }}>
                  {correctMcq}/{mcqAnswers.length}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>MCQ Correct</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#F59E0B' }}>
                  {taskAnswers.length}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Tasks Done</Text>
              </View>
            </View>
          </View>

          {/* MCQ Questions Review */}
          {mcqAnswers.length > 0 && (
            <>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
                MCQ Questions
              </Text>

              {mcqAnswers.map((answer: any, index: number) => {
                const question = submission.contestId?.questions?.find((q: any) => q._id === answer.questionId);
                if (!question) return null;
                
                const isCorrect = answer.isCorrect;

                return (
                  <View
                    key={answer._id || `mcq-${index}`}
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
                          MCQ {index + 1}
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
                      {question?.options?.map((option: any, optIndex: number) => {
                        const isUserAnswer = option._id === answer.selectedOption;
                        const isCorrectOption = option.isCorrect;
                        
                        // Default styling
                        let backgroundColor = colors.background;
                        let borderColor = isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.5)';
                        let textColor = colors.text;
                        
                        // Correct answer - always highlight in green
                        if (isCorrectOption) {
                          backgroundColor = isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)';
                          borderColor = '#10B981';
                          textColor = colors.text;
                        }
                        
                        // User's wrong answer - highlight in red
                        if (isUserAnswer && !isCorrect) {
                          backgroundColor = isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
                          borderColor = '#EF4444';
                          textColor = colors.text;
                        }

                        return (
                          <View
                            key={option._id || `opt-${index}-${optIndex}`}
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
                              {option.text || option || `Option ${optIndex + 1}`}
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
                  </View>
                );
              })}
            </>
          )}

          {/* Task Submissions Review */}
          {taskAnswers.length > 0 && (
            <>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16, marginTop: 8 }}>
                Task Submissions
              </Text>

              {taskAnswers.map((answer: any, index: number) => {
                const question = submission.contestId?.questions?.find((q: any) => q._id === answer.questionId);
                if (!question) return null;

                return (
                  <View
                    key={answer._id || `task-${index}`}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                      borderLeftWidth: 4,
                      borderLeftColor: '#8B5CF6',
                    }}
                  >
                    {/* Task Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: '#8B5CF6',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                          }}
                        >
                          <Ionicons name="create" size={20} color="white" />
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 }}>
                          Task {index + 1}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#8B5CF6' }}>
                          {answer.pointsAwarded}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textSecondary }}>points</Text>
                      </View>
                    </View>

                    {/* Task Description */}
                    <Text style={{ fontSize: 15, color: colors.text, marginBottom: 16, lineHeight: 22 }}>
                      {question?.question}
                    </Text>

                    {/* Your Submission */}
                    <View
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                        Your Submission:
                      </Text>
                      
                      {answer.photoUrl && (
                        <Image
                          source={{ uri: answer.photoUrl }}
                          style={{
                            width: '100%',
                            height: 200,
                            borderRadius: 8,
                          }}
                          resizeMode="cover"
                        />
                      )}
                      
                      {answer.textAnswer && !answer.photoUrl && (
                        <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
                          {answer.textAnswer}
                        </Text>
                      )}
                    </View>

                    {/* Admin Review */}
                    {answer.adminComment && (
                      <View
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                          borderLeftWidth: 3,
                          borderLeftColor: '#8B5CF6',
                          padding: 12,
                          borderRadius: 8,
                          marginTop: 12,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                          <Ionicons name="person-circle" size={16} color="#8B5CF6" />
                          <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '700', color: '#8B5CF6' }}>
                            Admin Review
                          </Text>
                        </View>
                        <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18 }}>
                          {answer.adminComment}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
