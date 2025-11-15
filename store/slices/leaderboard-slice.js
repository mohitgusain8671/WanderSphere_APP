import api from '../../utils/api';
import { LEADERBOARD_ROUTES } from '../../utils/constants';

export const createLeaderboardSlice = (set, get) => ({
  // State
  dailyLeaderboard: [],
  overallLeaderboard: [],
  contestLeaderboard: [],
  myRank: null,
  isLeaderboardLoading: false,
  leaderboardError: null,

  // Get Daily Leaderboard
  getDailyLeaderboard: async (limit = 50) => {
    set({ isLeaderboardLoading: true, leaderboardError: null });
    try {
      const response = await api.get(LEADERBOARD_ROUTES.DAILY, { params: { limit } });
      const data = response.data;

      if (data.success) {
        set({
          dailyLeaderboard: data.data.leaderboard,
          isLeaderboardLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ leaderboardError: data.message, isLeaderboardLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch daily leaderboard';
      set({ leaderboardError: errorMsg, isLeaderboardLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get Overall Leaderboard
  getOverallLeaderboard: async (limit = 50) => {
    set({ isLeaderboardLoading: true, leaderboardError: null });
    try {
      const response = await api.get(LEADERBOARD_ROUTES.OVERALL, { params: { limit } });
      const data = response.data;

      if (data.success) {
        set({
          overallLeaderboard: data.data.leaderboard,
          isLeaderboardLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ leaderboardError: data.message, isLeaderboardLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch overall leaderboard';
      set({ leaderboardError: errorMsg, isLeaderboardLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get Contest Leaderboard
  getContestLeaderboard: async (contestId, limit = 50) => {
    set({ isLeaderboardLoading: true, leaderboardError: null });
    try {
      const response = await api.get(LEADERBOARD_ROUTES.CONTEST(contestId), { params: { limit } });
      const data = response.data;

      if (data.success) {
        set({
          contestLeaderboard: data.data.leaderboard,
          isLeaderboardLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ leaderboardError: data.message, isLeaderboardLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch contest leaderboard';
      set({ leaderboardError: errorMsg, isLeaderboardLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get My Rank
  getMyRank: async () => {
    set({ isLeaderboardLoading: true, leaderboardError: null });
    try {
      const response = await api.get(LEADERBOARD_ROUTES.MY_RANK);
      const data = response.data;

      if (data.success) {
        set({
          myRank: data.data,
          isLeaderboardLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ leaderboardError: data.message, isLeaderboardLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch rank';
      set({ leaderboardError: errorMsg, isLeaderboardLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Clear Leaderboard State
  clearLeaderboardState: () => {
    set({
      dailyLeaderboard: [],
      overallLeaderboard: [],
      contestLeaderboard: [],
      myRank: null,
    });
  },
});
