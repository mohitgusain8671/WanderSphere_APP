import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router } from 'expo-router';

export default function ContestHistoryScreen() {
  const { colors } = useTheme();
  const { myContests, isContestLoading, getMyContestHistory } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    await getMyContestHistory();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/contests' as any)} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Contest History
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          Your past contest submissions
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />
        }
      >
        {isContestLoading && !myContests.length ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading history...</Text>
          </View>
        ) : myContests.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="trophy-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
              No contest history yet.{'\n'}Participate in your first contest!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/contests' as any)}
              style={{
                backgroundColor: '#3B82F6',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                marginTop: 20,
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                View Contests
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ padding: 20, gap: 12 }}>
            {myContests.map((submission: any) => {
              const mcqAnswers = submission.answers.filter((a: any) => a.questionType === 'mcq');
              const correctMcq = mcqAnswers.filter((a: any) => a.isCorrect).length;
              const percentage = mcqAnswers.length > 0 ? Math.round((correctMcq / mcqAnswers.length) * 100) : 0;

              return (
                <TouchableOpacity
                  key={submission._id}
                  onPress={() => router.push({
                    pathname: '/(tabs)/contest-review',
                    params: { submissionId: submission._id },
                  } as any)}
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                        {submission.contestId?.title || 'Contest'}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: '#3B82F6',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 20, fontWeight: '800', color: 'white' }}>
                        {submission.totalScore}
                      </Text>
                      <Text style={{ fontSize: 10, color: 'white' }}>
                        points
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={{ marginLeft: 6, fontSize: 14, color: colors.text }}>
                        {correctMcq}/{mcqAnswers.length} MCQ correct
                      </Text>
                    </View>
                    {percentage > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="stats-chart" size={16} color="#3B82F6" />
                        <Text style={{ marginLeft: 6, fontSize: 14, color: colors.text }}>
                          {percentage}% accuracy
                        </Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="create" size={16} color="#8B5CF6" />
                      <Text style={{ marginLeft: 6, fontSize: 14, color: colors.text }}>
                        {submission.answers.filter((a: any) => a.questionType === 'task').length} tasks
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Text style={{ fontSize: 13, color: '#3B82F6', fontWeight: '600', marginRight: 4 }}>
                      View Details
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
