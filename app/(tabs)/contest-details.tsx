import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

export default function ContestDetailsScreen() {
  const { colors, isDarkMode } = useTheme();
  const { contestId } = useLocalSearchParams();
  const {
    currentContest,
    contestProgress,
    isContestLoading,
    getContestById,
    startContest,
  } = useAppStore();

  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadContest();
  }, []);

  const loadContest = async () => {
    await getContestById(contestId as string);
  };

  const handleStartContest = async () => {
    if (currentContest?.status !== 'active') {
      Alert.alert('Contest Not Active', 'This contest is not currently active.');
      return;
    }

    if (contestProgress?.status === 'submitted') {
      Alert.alert('Already Submitted', 'You have already submitted this contest.');
      return;
    }

    if (contestProgress?.status === 'in_progress') {
      router.push({
        pathname: '/(tabs)/contest-play',
        params: { contestId },
      } as any);
      return;
    }

    setShowInstructions(true);
  };

  const handleProceedToContest = async () => {
    setShowInstructions(false);
    const result = await startContest(contestId as string);
    
    if (result.success) {
      router.push({
        pathname: '/(tabs)/contest-play',
        params: { contestId },
      } as any);
    } else {
      Alert.alert('Error', result.error || 'Failed to start contest');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'upcoming': return '#3B82F6';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getTimeRemaining = () => {
    if (!currentContest) return '';
    const now = new Date().getTime();
    const end = new Date(currentContest.endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (isContestLoading || !currentContest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const mcqCount = currentContest.questions.filter((q: any) => q.type === 'mcq').length;
  const taskCount = currentContest.questions.filter((q: any) => q.type === 'task').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        {/* Header */}
        <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: getStatusColor(currentContest.status),
              borderRadius: 20,
              alignSelf: 'flex-start',
              marginBottom: 16,
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>
              {currentContest.status.toUpperCase()}
            </Text>
          </View>

          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
            {currentContest.title}
          </Text>
          {currentContest.description && (
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
              {currentContest.description}
            </Text>
          )}
        </View>

        <View style={{ padding: 20 }}>
          {/* Time Remaining */}
          {currentContest.status === 'active' && (
            <View
              style={{
                backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                padding: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Ionicons name="time" size={24} color="#10B981" />
              <Text style={{ marginLeft: 12, fontSize: 16, color: '#10B981', fontWeight: '700', flex: 1 }}>
                {getTimeRemaining()}
              </Text>
            </View>
          )}

          {/* Contest Info */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
              Contest Details
            </Text>

            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#3B82F6',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="help-circle" size={20} color="white" />
                </View>
                <View>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    Total Questions
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {currentContest.questions.length} ({mcqCount} MCQ, {taskCount} Tasks)
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F59E0B',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="star" size={20} color="white" />
                </View>
                <View>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    Total Points
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {currentContest.totalPoints} Points
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#10B981',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="people" size={20} color="white" />
                </View>
                <View>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    Participants
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {currentContest.participantCount} Joined
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Prize */}
          {currentContest.prize?.description && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="gift" size={24} color="#F59E0B" />
                <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: '700', color: colors.text }}>
                  Prize
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                {currentContest.prize.description}
              </Text>
              {currentContest.prize.value && (
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#F59E0B', marginTop: 8 }}>
                  {currentContest.prize.value}
                </Text>
              )}
            </View>
          )}

          {/* Duration */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
              Duration
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                  Starts
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                  {new Date(currentContest.startTime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                  Ends
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                  {new Date(currentContest.endTime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          {contestProgress?.status === 'submitted' ? (
            <View
              style={{
                backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                padding: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={{ marginLeft: 12, fontSize: 14, color: '#10B981', fontWeight: '600' }}>
                You've submitted this contest
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleStartContest}
              disabled={currentContest.status !== 'active'}
              style={{
                backgroundColor: currentContest.status === 'active' ? '#3B82F6' : colors.background,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                opacity: currentContest.status === 'active' ? 1 : 0.5,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                {contestProgress?.status === 'in_progress' ? 'Continue Contest' : 'Start Contest'}
              </Text>
            </TouchableOpacity>
          )}

          {currentContest.hasLeaderboard && (
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/(tabs)/leaderboard',
                params: { contestId },
              } as any)}
              style={{
                backgroundColor: colors.surface,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginTop: 12,
                borderWidth: 2,
                borderColor: '#3B82F6',
              }}
            >
              <Text style={{ color: '#3B82F6', fontSize: 16, fontWeight: '700' }}>
                View Leaderboard
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>Contest Instructions</Text>
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
                    <Ionicons name="save" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      Save Progress
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                      You can save your progress and come back before the deadline.
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
                      Submit before {new Date(currentContest.endTime).toLocaleString()}
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
                    <Ionicons name="create" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      Edit Answers
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                      You can change your answers before final submission.
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
                      Final Submission
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                      Once submitted, you cannot change your answers.
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleProceedToContest}
                disabled={isContestLoading}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 24,
                  opacity: isContestLoading ? 0.6 : 1,
                }}
              >
                {isContestLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                    I Understand, Start Contest
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
