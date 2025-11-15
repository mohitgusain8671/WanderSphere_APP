import api from '../../utils/api';
import { QUIZ_ROUTES } from '../../utils/constants';

export const createQuizSlice = (set, get) => ({
  // User State
  todayQuiz: null,
  quizHistory: [],
  hasAttemptedToday: false,
  isQuizLoading: false,
  quizError: null,
  quizPagination: null,

  // Admin State
  adminQuizzes: [],
  isAdminQuizLoading: false,
  adminQuizError: null,
  adminQuizPagination: null,
  selectedQuiz: null,

  // ==================== USER ACTIONS ====================

  // Get Today's Quiz
  getTodayQuiz: async () => {
    set({ isQuizLoading: true, quizError: null });
    try {
      const response = await api.get(QUIZ_ROUTES.TODAY);
      const data = response.data;

      if (data.success) {
        set({
          todayQuiz: data.data.quiz,
          hasAttemptedToday: data.data.hasAttempted,
          isQuizLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ quizError: data.message, isQuizLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch quiz';
      set({ quizError: errorMsg, isQuizLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Submit Quiz Attempt
  submitQuizAttempt: async (quizId, answers) => {
    set({ isQuizLoading: true, quizError: null });
    try {
      const response = await api.post(QUIZ_ROUTES.ATTEMPT, { quizId, answers });
      const data = response.data;

      if (data.success) {
        set({
          hasAttemptedToday: true,
          isQuizLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ quizError: data.message, isQuizLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit quiz';
      set({ quizError: errorMsg, isQuizLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get My Quiz History
  getMyQuizHistory: async (filters = {}) => {
    set({ isQuizLoading: true, quizError: null });
    try {
      const response = await api.get(QUIZ_ROUTES.MY_HISTORY, { params: filters });
      const data = response.data;

      if (data.success) {
        set({
          quizHistory: data.data.attempts,
          quizPagination: data.data.pagination,
          isQuizLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ quizError: data.message, isQuizLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch history';
      set({ quizError: errorMsg, isQuizLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Check Today's Attempt
  checkTodayAttempt: async () => {
    try {
      const response = await api.get(QUIZ_ROUTES.CHECK_TODAY);
      const data = response.data;

      if (data.success) {
        set({ hasAttemptedToday: data.data.hasAttempted });
        return { success: true, data: data.data };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  },

  // ==================== ADMIN ACTIONS ====================

  // Create Quiz
  createQuiz: async (quizData) => {
    set({ isAdminQuizLoading: true, adminQuizError: null });
    try {
      const response = await api.post(QUIZ_ROUTES.ADMIN_CREATE, quizData);
      const data = response.data;

      if (data.success) {
        set({ isAdminQuizLoading: false });
        return { success: true, data: data.data };
      } else {
        set({ adminQuizError: data.message, isAdminQuizLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create quiz';
      set({ adminQuizError: errorMsg, isAdminQuizLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Update Quiz
  updateQuiz: async (quizId, updates) => {
    set({ isAdminQuizLoading: true, adminQuizError: null });
    try {
      const response = await api.put(QUIZ_ROUTES.ADMIN_UPDATE(quizId), updates);
      const data = response.data;

      if (data.success) {
        set(state => ({
          adminQuizzes: state.adminQuizzes.map(quiz =>
            quiz._id === quizId ? data.data.quiz : quiz
          ),
          isAdminQuizLoading: false,
        }));
        return { success: true, data: data.data };
      } else {
        set({ adminQuizError: data.message, isAdminQuizLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update quiz';
      set({ adminQuizError: errorMsg, isAdminQuizLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Delete Quiz
  deleteQuiz: async (quizId) => {
    set({ isAdminQuizLoading: true, adminQuizError: null });
    try {
      const response = await api.delete(QUIZ_ROUTES.ADMIN_DELETE(quizId));
      const data = response.data;

      if (data.success) {
        set(state => ({
          adminQuizzes: state.adminQuizzes.filter(quiz => quiz._id !== quizId),
          isAdminQuizLoading: false,
        }));
        return { success: true };
      } else {
        set({ adminQuizError: data.message, isAdminQuizLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete quiz';
      set({ adminQuizError: errorMsg, isAdminQuizLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get All Quizzes (Admin)
  getAllQuizzes: async (filters = {}) => {
    set({ isAdminQuizLoading: true, adminQuizError: null });
    try {
      const response = await api.get(QUIZ_ROUTES.ADMIN_ALL, { params: filters });
      const data = response.data;

      if (data.success) {
        set({
          adminQuizzes: data.data.quizzes,
          adminQuizPagination: data.data.pagination,
          isAdminQuizLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ adminQuizError: data.message, isAdminQuizLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch quizzes';
      set({ adminQuizError: errorMsg, isAdminQuizLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get Quiz by ID (Admin)
  getQuizById: async (quizId) => {
    set({ isAdminQuizLoading: true, adminQuizError: null });
    try {
      const response = await api.get(QUIZ_ROUTES.ADMIN_GET(quizId));
      const data = response.data;

      if (data.success) {
        set({
          selectedQuiz: data.data,
          isAdminQuizLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ adminQuizError: data.message, isAdminQuizLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch quiz';
      set({ adminQuizError: errorMsg, isAdminQuizLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Clear Quiz State
  clearQuizState: () => {
    set({
      todayQuiz: null,
      quizHistory: [],
      hasAttemptedToday: false,
      adminQuizzes: [],
      selectedQuiz: null,
    });
  },
});
