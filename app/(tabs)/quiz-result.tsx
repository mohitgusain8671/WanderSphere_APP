import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';
import Confetti from 'react-native-confetti';

export default function QuizResultScreen() {
  const { colors, isDarkMode } = useTheme();
  const { score, correct, total } = useLocalSearchParams();
  const { getMyRank } = useAppStore();
  const [myRank, setMyRank] = React.useState<any>(null);

  const scoreNum = parseInt(score as string);
  const correctNum = parseInt(correct as string);
  const totalNum = parseInt(total as string);
  const percentage = Math.round((correctNum / totalNum) * 100);

  useEffect(() => {
    loadRank();
  }, []);

  const loadRank = async () => {
    const result = await getMyRank();
    if (result.success) {
      setMyRank(result.data);
    }
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: 'Outstanding! 🎉', color: '#10B981' };
    if (percentage >= 75) return { message: 'Great Job! 👏', color: '#3B82F6' };
    if (percentage >= 60) return { message: 'Good Effort! 👍', color: '#F59E0B' };
    return { message: 'Keep Practicing! 💪', color: '#EF4444' };
  };

  const performance = getPerformanceMessage();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        {/* Header */}
        <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60, alignItems: 'center' }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: performance.color,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="trophy" size={50} color="white" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
            Quiz Complete!
          </Text>
          <Text style={{ fontSize: 16, color: performance.color, fontWeight: '600' }}>
            {performance.message}
          </Text>
        </View>

        {/* Score Card */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 48, fontWeight: '800', color: '#3B82F6' }}>
                {scoreNum}
              </Text>
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                Total Points
              </Text>
            </View>

            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text }}>
                    Correct Answers
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                  {correctNum}/{totalNum}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="stats-chart" size={24} color="#3B82F6" />
                  <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text }}>
                    Accuracy
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                  {percentage}%
                </Text>
              </View>

              {myRank?.dailyRank && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="trophy" size={24} color="#F59E0B" />
                    <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text }}>
                      Today's Rank
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                    #{myRank.dailyRank}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Overall Stats */}
          {myRank?.stats && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
                Your Overall Stats
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <View style={{ flex: 1, minWidth: 150, backgroundColor: colors.background, padding: 16, borderRadius: 12 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#3B82F6' }}>
                    {myRank.stats.totalPoints}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                    Total Points
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 150, backgroundColor: colors.background, padding: 16, borderRadius: 12 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#10B981' }}>
                    #{myRank.overallRank}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                    Overall Rank
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 150, backgroundColor: colors.background, padding: 16, borderRadius: 12 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#F59E0B' }}>
                    {myRank.stats.quizzesTaken}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                    Quizzes Taken
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 150, backgroundColor: colors.background, padding: 16, borderRadius: 12 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#8B5CF6' }}>
                    {Math.round(myRank.stats.averageScore)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                    Avg Score
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={{ gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/leaderboard' as any)}
              style={{
                backgroundColor: '#3B82F6',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                View Leaderboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/quiz-history' as any)}
              style={{
                backgroundColor: colors.surface,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#3B82F6',
              }}
            >
              <Text style={{ color: '#3B82F6', fontSize: 16, fontWeight: '700' }}>
                View History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/quiz' as any)}
              style={{
                backgroundColor: colors.surface,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                Back to Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
