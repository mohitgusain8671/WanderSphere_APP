import api from '../../utils/api';
import { CONTEST_ROUTES } from '../../utils/constants';

export const createContestSlice = (set, get) => ({
  // User State
  activeContests: [],
  myContests: [],
  currentContest: null,
  contestProgress: null,
  isContestLoading: false,
  contestError: null,
  contestPagination: null,

  // Admin State
  adminContests: [],
  contestSubmissions: [],
  isAdminContestLoading: false,
  adminContestError: null,
  adminContestPagination: null,
  submissionsPagination: null,

  // ==================== USER ACTIONS ====================

  // Get Active Contests
  getActiveContests: async () => {
    set({ isContestLoading: true, contestError: null });
    try {
      const response = await api.get(CONTEST_ROUTES.ACTIVE);
      const data = response.data;

      if (data.success) {
        set({
          activeContests: data.data.contests,
          isContestLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ contestError: data.message, isContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch contests';
      set({ contestError: errorMsg, isContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get Contest by ID
  getContestById: async (contestId) => {
    set({ isContestLoading: true, contestError: null });
    try {
      const response = await api.get(CONTEST_ROUTES.GET(contestId));
      const data = response.data;

      if (data.success) {
        set({
          currentContest: data.data.contest,
          contestProgress: data.data.submission,
          isContestLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ contestError: data.message, isContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch contest';
      set({ contestError: errorMsg, isContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Start Contest
  startContest: async (contestId) => {
    set({ isContestLoading: true, contestError: null });
    try {
      const response = await api.post(CONTEST_ROUTES.START(contestId));
      const data = response.data;

      if (data.success) {
        set({
          contestProgress: data.data.submission,
          isContestLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ contestError: data.message, isContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to start contest';
      set({ contestError: errorMsg, isContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Save Contest Progress
  saveContestProgress: async (contestId, answers) => {
    set({ isContestLoading: true, contestError: null });
    try {
      const response = await api.put(CONTEST_ROUTES.PROGRESS(contestId), { answers });
      const data = response.data;

      if (data.success) {
        set({
          contestProgress: data.data.submission,
          isContestLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ contestError: data.message, isContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save progress';
      set({ contestError: errorMsg, isContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Upload Contest Task Photo
  uploadContestTaskPhoto: async (imageUri) => {
    set({ isContestLoading: true, contestError: null });
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `contest_task_${Date.now()}.jpg`,
      });

      const response = await api.post(CONTEST_ROUTES.UPLOAD_TASK_PHOTO, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        set({ isContestLoading: false });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload photo';
      set({ contestError: errorMessage, isContestLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Submit Contest
  submitContest: async (contestId, answers) => {
    set({ isContestLoading: true, contestError: null });
    try {
      const response = await api.post(CONTEST_ROUTES.SUBMIT(contestId), { answers });
      const data = response.data;

      if (data.success) {
        set({
          contestProgress: null,
          isContestLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ contestError: data.message, isContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit contest';
      set({ contestError: errorMsg, isContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get My Contest History
  getMyContestHistory: async (filters = {}) => {
    set({ isContestLoading: true, contestError: null });
    try {
      const response = await api.get(CONTEST_ROUTES.MY_HISTORY, { params: filters });
      const data = response.data;

      if (data.success) {
        set({
          myContests: data.data.submissions,
          contestPagination: data.data.pagination,
          isContestLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ contestError: data.message, isContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch history';
      set({ contestError: errorMsg, isContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // ==================== ADMIN ACTIONS ====================

  // Create Contest
  createContest: async (contestData) => {
    set({ isAdminContestLoading: true, adminContestError: null });
    try {
      const response = await api.post(CONTEST_ROUTES.ADMIN_CREATE, contestData);
      const data = response.data;

      if (data.success) {
        set({ isAdminContestLoading: false });
        return { success: true, data: data.data };
      } else {
        set({ adminContestError: data.message, isAdminContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create contest';
      set({ adminContestError: errorMsg, isAdminContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Update Contest
  updateContest: async (contestId, updates) => {
    set({ isAdminContestLoading: true, adminContestError: null });
    try {
      const response = await api.put(CONTEST_ROUTES.ADMIN_UPDATE(contestId), updates);
      const data = response.data;

      if (data.success) {
        set(state => ({
          adminContests: state.adminContests.map(contest =>
            contest._id === contestId ? data.data.contest : contest
          ),
          isAdminContestLoading: false,
        }));
        return { success: true, data: data.data };
      } else {
        set({ adminContestError: data.message, isAdminContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update contest';
      set({ adminContestError: errorMsg, isAdminContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Delete Contest
  deleteContest: async (contestId) => {
    set({ isAdminContestLoading: true, adminContestError: null });
    try {
      const response = await api.delete(CONTEST_ROUTES.ADMIN_DELETE(contestId));
      const data = response.data;

      if (data.success) {
        set(state => ({
          adminContests: state.adminContests.filter(contest => contest._id !== contestId),
          isAdminContestLoading: false,
        }));
        return { success: true };
      } else {
        set({ adminContestError: data.message, isAdminContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete contest';
      set({ adminContestError: errorMsg, isAdminContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get All Contests (Admin)
  getAllContests: async (filters = {}) => {
    set({ isAdminContestLoading: true, adminContestError: null });
    try {
      const response = await api.get(CONTEST_ROUTES.ADMIN_ALL, { params: filters });
      const data = response.data;

      if (data.success) {
        set({
          adminContests: data.data.contests,
          adminContestPagination: data.data.pagination,
          isAdminContestLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ adminContestError: data.message, isAdminContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch contests';
      set({ adminContestError: errorMsg, isAdminContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get Contest Submissions (Admin)
  getContestSubmissions: async (contestId, filters = {}) => {
    set({ isAdminContestLoading: true, adminContestError: null });
    try {
      const response = await api.get(CONTEST_ROUTES.ADMIN_SUBMISSIONS(contestId), { params: filters });
      const data = response.data;

      if (data.success) {
        set({
          contestSubmissions: data.data.submissions,
          submissionsPagination: data.data.pagination,
          isAdminContestLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ adminContestError: data.message, isAdminContestLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch submissions';
      set({ adminContestError: errorMsg, isAdminContestLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Clear Contest State
  clearContestState: () => {
    set({
      activeContests: [],
      myContests: [],
      currentContest: null,
      contestProgress: null,
      adminContests: [],
      contestSubmissions: [],
    });
  },
});
