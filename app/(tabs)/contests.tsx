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

export default function ContestsScreen() {
  const { colors, isDarkMode } = useTheme();
  const { activeContests, isContestLoading, getActiveContests } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    await getActiveContests();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContests();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'upcoming': return '#3B82F6';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active Now';
      case 'upcoming': return 'Coming Soon';
      case 'completed': return 'Ended';
      default: return status;
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.surface, padding: 20, paddingTop: 60 }}>
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
          Contests
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          Compete with others and win prizes!
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />
        }
      >
        {/* Quick Link to History */}
        <View style={{ padding: 20, paddingBottom: 0 }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/contest-history' as any)}
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={24} color="#8B5CF6" />
              <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: '600', color: colors.text }}>
                Contest History
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {isContestLoading && !activeContests.length ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading contests...</Text>
          </View>
        ) : activeContests.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="trophy-outline" size={64} color={colors.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
              No active contests at the moment.{'\n'}Check back soon!
            </Text>
          </View>
        ) : (
          <View style={{ padding: 20, gap: 16 }}>
            {activeContests.map((contest: any) => (
              <TouchableOpacity
                key={contest._id}
                onPress={() => router.push({
                  pathname: '/(tabs)/contest-details',
                  params: { contestId: contest._id },
                } as any)}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {/* Status Banner */}
                <View
                  style={{
                    backgroundColor: getStatusColor(contest.status),
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>
                    {getStatusText(contest.status)}
                  </Text>
                  {contest.status === 'active' && (
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                      {getTimeRemaining(contest.endTime)}
                    </Text>
                  )}
                </View>

                <View style={{ padding: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: '#3B82F6',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="trophy" size={28} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                        {contest.title}
                      </Text>
                      {contest.description && (
                        <Text style={{ fontSize: 14, color: colors.textSecondary }} numberOfLines={2}>
                          {contest.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Contest Info */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="help-circle" size={16} color="#3B82F6" />
                      <Text style={{ marginLeft: 6, fontSize: 13, color: colors.text }}>
                        {contest.questions.length} Questions
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={{ marginLeft: 6, fontSize: 13, color: colors.text }}>
                        {contest.totalPoints} Points
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="people" size={16} color="#10B981" />
                      <Text style={{ marginLeft: 6, fontSize: 13, color: colors.text }}>
                        {contest.participantCount} Participants
                      </Text>
                    </View>
                  </View>

                  {/* Prize */}
                  {contest.prize?.description && (
                    <View
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                        padding: 12,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <Ionicons name="gift" size={20} color="#F59E0B" />
                      <Text style={{ marginLeft: 8, fontSize: 13, color: '#F59E0B', fontWeight: '600', flex: 1 }}>
                        Prize: {contest.prize.description}
                      </Text>
                    </View>
                  )}

                  {/* Dates */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        Starts
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                        {new Date(contest.startTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        Ends
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                        {new Date(contest.endTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Action Button */}
                  <View
                    style={{
                      backgroundColor: contest.status === 'active' ? '#3B82F6' : colors.background,
                      paddingVertical: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: contest.status === 'active' ? 'white' : colors.text,
                        fontSize: 14,
                        fontWeight: '700',
                      }}
                    >
                      {contest.status === 'active' ? 'Join Contest' : 'View Details'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
