import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../store';
import { router, useLocalSearchParams } from 'expo-router';

export default function ContestResultScreen() {
  const { colors } = useTheme();
  const { score, contestId } = useLocalSearchParams();
  const { getContestLeaderboard, contestLeaderboard } = useAppStore();

  const scoreNum = parseInt(score as string);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    await getContestLeaderboard(contestId as string, 10);
  };

  const myRank = contestLeaderboard.findIndex((entry: any) => entry.score === scoreNum) + 1;

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
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="trophy" size={50} color="white" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
            Contest Submitted!
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            Great job completing the contest
          </Text>
        </View>

        {/* Score Card */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 48, fontWeight: '800', color: '#3B82F6' }}>
              {scoreNum}
            </Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 20 }}>
              Total Points
            </Text>

            {myRank > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="trophy" size={24} color="#F59E0B" />
                <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: '700', color: colors.text }}>
                  Rank #{myRank}
                </Text>
              </View>
            )}
          </View>

          {/* Top Performers */}
          {contestLeaderboard.length > 0 && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
                Top Performers
              </Text>
              {contestLeaderboard.slice(0, 5).map((entry: any, index: number) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: index < 4 ? 1 : 0,
                    borderBottomColor: colors.background,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#CD7F32' : '#3B82F6',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>
                      {entry.rank}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      {entry.user?.firstName} {entry.user?.lastName}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                    {entry.score}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={{ gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/(tabs)/leaderboard',
                params: { contestId },
              } as any)}
              style={{
                backgroundColor: '#3B82F6',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                View Full Leaderboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/contests' as any)}
              style={{
                backgroundColor: colors.surface,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                Back to Contests
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
