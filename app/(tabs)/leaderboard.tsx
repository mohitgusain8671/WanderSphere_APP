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
import { useAppStore } from '../../store';
import { useLocalSearchParams, router } from 'expo-router';

export default function LeaderboardScreen() {
  const { colors, isDarkMode } = useTheme();
  const { contestId } = useLocalSearchParams();
  const {
    user,
    dailyLeaderboard,
    overallLeaderboard,
    contestLeaderboard,
    myRank,
    isLeaderboardLoading,
    getDailyLeaderboard,
    getOverallLeaderboard,
    getContestLeaderboard,
    getMyRank,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState(contestId ? 'contest' : 'daily');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadLeaderboard(true);
    loadMyRank();
  }, [activeTab]);

  const loadLeaderboard = async (reset = false) => {
    if (isLoadingMore && !reset) return; // Prevent multiple simultaneous loads
    
    const currentPage = reset ? 1 : page;
    const limit = 20;
    const totalToLoad = limit * currentPage;
    
    if (!reset) setIsLoadingMore(true);
    
    let result;
    if (activeTab === 'daily') {
      result = await getDailyLeaderboard(totalToLoad);
    } else if (activeTab === 'overall') {
      result = await getOverallLeaderboard(totalToLoad);
    } else if (activeTab === 'contest' && contestId) {
      result = await getContestLeaderboard(contestId as string, totalToLoad);
    }
    
    // Check if we got fewer items than requested (means no more data)
    const currentLeaderboard = getCurrentLeaderboard();
    if (currentLeaderboard.length < totalToLoad) {
      setHasMore(false);
    }
    
    if (reset) {
      setPage(1);
      setHasMore(true);
    }
    
    setIsLoadingMore(false);
  };

  const loadMyRank = async () => {
    await getMyRank();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard(true);
    await loadMyRank();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLeaderboardLoading) {
      setPage(prevPage => prevPage + 1);
      loadLeaderboard(false);
    }
  };

  const getCurrentLeaderboard = () => {
    if (activeTab === 'daily') return dailyLeaderboard;
    if (activeTab === 'overall') return overallLeaderboard;
    return contestLeaderboard;
  };

  const leaderboard = getCurrentLeaderboard();

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#F59E0B';
    if (rank === 2) return '#9CA3AF';
    if (rank === 3) return '#CD7F32';
    return '#3B82F6';
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
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
          Leaderboard
        </Text>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {!contestId && (
            <>
              <TouchableOpacity
                onPress={() => setActiveTab('daily')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: activeTab === 'daily' ? '#3B82F6' : colors.background,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: activeTab === 'daily' ? 'white' : colors.text,
                    fontSize: 14,
                    fontWeight: '700',
                  }}
                >
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('overall')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: activeTab === 'overall' ? '#3B82F6' : colors.background,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: activeTab === 'overall' ? 'white' : colors.text,
                    fontSize: 14,
                    fontWeight: '700',
                  }}
                >
                  Overall
                </Text>
              </TouchableOpacity>
            </>
          )}
          {contestId && (
            <View style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#3B82F6' }}>
              <Text style={{ textAlign: 'center', color: 'white', fontSize: 14, fontWeight: '700' }}>
                Contest
              </Text>
            </View>
          )}
        </View>
      </View>

      {isLeaderboardLoading && !leaderboard.length ? (
        <View style={{ flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading leaderboard...</Text>
        </View>
      ) : leaderboard.length === 0 ? (
        <View style={{ flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="trophy-outline" size={64} color={colors.textSecondary} />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
            No rankings yet.{'\n'}Be the first to participate!
          </Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item, index) => `${item._id || index}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} tintColor="#3B82F6" />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={() => (
            <View style={{ padding: 20 }}>
              {/* My Rank Card */}
              {myRank && activeTab !== 'contest' && (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                    borderWidth: 2,
                    borderColor: '#3B82F6',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="person-circle" size={24} color="#3B82F6" />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginLeft: 8 }}>
                      Your Rank
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                        {activeTab === 'daily' ? 'Today' : 'Overall'}
                      </Text>
                      <Text style={{ fontSize: 32, fontWeight: '800', color: '#3B82F6' }}>
                        #{activeTab === 'daily' ? myRank.dailyRank : myRank.overallRank}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                        Points
                      </Text>
                      <Text style={{ fontSize: 32, fontWeight: '800', color: colors.text }}>
                        {myRank.stats?.totalPoints || 0}
                      </Text>
                    </View>
                  </View>
                  {activeTab === 'overall' && myRank.stats && (
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.background }}>
                      <View>
                        <Text style={{ fontSize: 11, color: colors.textSecondary }}>Quizzes</Text>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                          {myRank.stats.quizzesTaken || 0}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 11, color: colors.textSecondary }}>Contests</Text>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                          {myRank.stats.contestsParticipated || 0}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Rankings Title */}
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
                All Rankings
              </Text>
            </View>
          )}
          renderItem={({ item: entry, index }) => {
            const isCurrentUser = entry.user?._id === user?._id;
            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  backgroundColor: isCurrentUser ? (isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)') : colors.background,
                  borderLeftWidth: isCurrentUser ? 4 : 0,
                  borderLeftColor: '#3B82F6',
                  marginBottom: 1,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: getRankColor(entry.rank),
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                    {entry.rank}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                    {entry.user?.firstName} {entry.user?.lastName}
                    {isCurrentUser && ' (You)'}
                  </Text>
                  {activeTab === 'overall' && entry.quizzesTaken !== undefined && (
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                      {entry.quizzesTaken} quizzes • {entry.contestsParticipated} contests
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                  {entry.score || entry.totalPoints}
                </Text>
              </View>
            );
          }}
          ListFooterComponent={() => (
            isLoadingMore && hasMore ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>
                  Loading more...
                </Text>
              </View>
            ) : !hasMore && leaderboard.length > 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  No more rankings to load
                </Text>
              </View>
            ) : null
          )}
        />
      )}
    </View>
  );
}
