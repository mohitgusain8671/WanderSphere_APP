import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

export default function QuizPlayScreen() {
  const { colors } = useTheme();
  const { quizId } = useLocalSearchParams();
  const { todayQuiz, submitQuizAttempt, isQuizLoading } = useAppStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = todayQuiz?.questions[currentQuestionIndex];
  const totalQuestions = todayQuiz?.questions.length || 0;

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit);
      setQuestionStartTime(Date.now());
      setSelectedAnswer(null);
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleNextQuestion = () => {
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    
    const answer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer: selectedAnswer !== null ? selectedAnswer : -1,
      timeTaken,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitQuiz(newAnswers);
    }
  };

  const handleSubmitQuiz = async (finalAnswers: any[]) => {
    const result = await submitQuizAttempt(quizId as string, finalAnswers);
    
    if (result.success) {
      router.replace({
        pathname: '/(tabs)/quiz-result',
        params: { 
          score: result.data.totalScore,
          correct: result.data.correctAnswers,
          total: result.data.totalQuestions,
        },
      } as any);
    } else {
      Alert.alert('Error', result.error || 'Failed to submit quiz');
    }
  };

  if (!todayQuiz || !currentQuestion) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const timePercentage = (timeLeft / currentQuestion.timeLimit) * 100;
  const timeColor = timeLeft <= 5 ? '#EF4444' : timeLeft <= 10 ? '#F59E0B' : '#10B981';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time" size={20} color={timeColor} />
            <Text style={{ marginLeft: 6, fontSize: 18, fontWeight: '700', color: timeColor }}>
              {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ height: 8, backgroundColor: colors.background, borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3B82F6', borderRadius: 4 }} />
        </View>

        {/* Time Bar */}
        <View style={{ height: 4, backgroundColor: colors.background, borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
          <View style={{ height: '100%', width: `${timePercentage}%`, backgroundColor: timeColor, borderRadius: 2 }} />
        </View>
      </View>

      {/* Question */}
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, lineHeight: 28 }}>
            {currentQuestion.question}
          </Text>
        </View>

        {/* Options */}
        <View style={{ gap: 12 }}>
          {currentQuestion.options.map((option: string, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedAnswer(index)}
              disabled={isQuizLoading}
              style={{
                backgroundColor: selectedAnswer === index ? '#3B82F6' : colors.surface,
                padding: 20,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedAnswer === index ? '#3B82F6' : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: selectedAnswer === index ? 'white' : colors.background,
                    borderWidth: 2,
                    borderColor: selectedAnswer === index ? 'white' : colors.textSecondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  {selectedAnswer === index && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3B82F6' }} />}
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: selectedAnswer === index ? 'white' : colors.text,
                    fontWeight: selectedAnswer === index ? '600' : '400',
                  }}
                >
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNextQuestion}
          disabled={selectedAnswer === null || isQuizLoading}
          style={{
            backgroundColor: selectedAnswer !== null ? '#3B82F6' : colors.background,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 24,
            opacity: selectedAnswer !== null ? 1 : 0.5,
          }}
        >
          {isQuizLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
              {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Submit Quiz'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Bonus Indicator */}
        {timeLeft <= currentQuestion.bonusTimeThreshold && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              padding: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="flash" size={20} color="#F59E0B" />
            <Text style={{ marginLeft: 8, fontSize: 14, color: '#F59E0B', fontWeight: '600' }}>
              Bonus time! +{currentQuestion.bonusPoints} points
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
