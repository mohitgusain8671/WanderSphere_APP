import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

export default function ContestPlayScreen() {
  const { colors } = useTheme();
  const { contestId } = useLocalSearchParams();
  const {
    currentContest,
    contestProgress,
    isContestLoading,
    saveContestProgress,
    submitContest,
  } = useAppStore();

  const [answers, setAnswers] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (contestProgress?.answers) {
      setAnswers(contestProgress.answers);
    } else if (currentContest?.questions) {
      setAnswers(currentContest.questions.map(() => ({})));
    }
  }, [contestProgress, currentContest]);

  const handleAnswerChange = (index: number, answer: any) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], ...answer };
    setAnswers(newAnswers);
    setHasUnsavedChanges(true);
  };

  const handleSaveProgress = async () => {
    const result = await saveContestProgress(contestId as string, answers);
    if (result.success) {
      setHasUnsavedChanges(false);
      Alert.alert('Success', 'Progress saved successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to save progress');
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Contest',
      'Are you sure you want to submit? You cannot change your answers after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'destructive',
          onPress: async () => {
            const result = await submitContest(contestId as string, answers);
            if (result.success) {
              router.replace({
                pathname: '/(tabs)/contest-result',
                params: {
                  score: result.data.totalScore,
                  contestId,
                },
              } as any);
            } else {
              Alert.alert('Error', result.error || 'Failed to submit contest');
            }
          },
        },
      ]
    );
  };

  if (!currentContest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const progress = (answers.filter(a => a.selectedAnswer !== undefined || a.taskSubmission).length / currentContest.questions.length) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
            {currentContest.title}
          </Text>
          {hasUnsavedChanges && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B', marginRight: 6 }} />
              <Text style={{ fontSize: 12, color: '#F59E0B' }}>
                Unsaved
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={{ height: 8, backgroundColor: colors.background, borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3B82F6', borderRadius: 4 }} />
        </View>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
          {answers.filter(a => a.selectedAnswer !== undefined || a.taskSubmission).length} of {currentContest.questions.length} answered
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20, gap: 20 }}>
          {currentContest.questions.map((question: any, index: number) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#3B82F6' }}>
                  Question {index + 1}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: '600', color: colors.text }}>
                    {question.points} pts
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 16, lineHeight: 22 }}>
                {question.question}
              </Text>

              {question.type === 'mcq' ? (
                <View style={{ gap: 10 }}>
                  {question.options.map((option: string, optIndex: number) => (
                    <TouchableOpacity
                      key={optIndex}
                      onPress={() => handleAnswerChange(index, { questionIndex: index, selectedAnswer: optIndex, type: 'mcq' })}
                      style={{
                        backgroundColor: answers[index]?.selectedAnswer === optIndex ? '#3B82F6' : colors.background,
                        padding: 16,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: answers[index]?.selectedAnswer === optIndex ? '#3B82F6' : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: answers[index]?.selectedAnswer === optIndex ? 'white' : colors.text,
                          fontWeight: answers[index]?.selectedAnswer === optIndex ? '600' : '400',
                        }}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                    {question.taskDescription}
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      padding: 12,
                      borderRadius: 8,
                      color: colors.text,
                      minHeight: 100,
                      textAlignVertical: 'top',
                    }}
                    placeholder={`Enter your ${question.taskType} submission...`}
                    placeholderTextColor={colors.textSecondary}
                    value={answers[index]?.taskSubmission || ''}
                    onChangeText={(text) => handleAnswerChange(index, {
                      questionIndex: index,
                      taskSubmission: text,
                      taskSubmissionType: question.taskType,
                      type: 'task',
                    })}
                    multiline
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={{ backgroundColor: colors.surface, padding: 20, gap: 12 }}>
        <TouchableOpacity
          onPress={handleSaveProgress}
          disabled={!hasUnsavedChanges || isContestLoading}
          style={{
            backgroundColor: hasUnsavedChanges ? '#F59E0B' : colors.background,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            opacity: hasUnsavedChanges ? 1 : 0.5,
          }}
        >
          {isContestLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>
              Save Progress
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isContestLoading}
          style={{
            backgroundColor: '#3B82F6',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            Submit Contest
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
