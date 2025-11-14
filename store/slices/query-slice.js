import api from '../../utils/api';
import { QUERY_ROUTES } from '../../utils/constants';

export const createQuerySlice = (set, get) => ({
  // User Queries State
  userQueries: [],
  isQueryLoading: false,
  queryError: null,
  queryPagination: null,

  // Admin Queries State
  adminQueries: [],
  isAdminQueriesLoading: false,
  adminQueriesError: null,
  adminQueriesPagination: null,

  // Query Statistics
  queryStatistics: null,

  // User: Create Query
  createQuery: async (queryData) => {
    set({ isQueryLoading: true, queryError: null });
    try {
      const response = await api.post(QUERY_ROUTES.CREATE, queryData);
      const data = response.data;

      if (data.success) {
        // Add new query to the beginning of the list
        set(state => ({
          userQueries: [data.data.query, ...state.userQueries],
          isQueryLoading: false,
        }));
        return { success: true, data: data.data.query };
      } else {
        set({ queryError: data.message, isQueryLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create query';
      set({ queryError: errorMsg, isQueryLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // User: Get My Queries
  getMyQueries: async (filters = {}) => {
    set({ isQueryLoading: true, queryError: null });
    try {
      const response = await api.get(QUERY_ROUTES.MY_QUERIES, { params: filters });
      const data = response.data;

      if (data.success) {
        set({
          userQueries: data.data.queries,
          queryPagination: data.data.pagination,
          isQueryLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ queryError: data.message, isQueryLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch queries';
      set({ queryError: errorMsg, isQueryLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // User: Get Query by ID
  getQueryById: async (queryId) => {
    set({ isQueryLoading: true, queryError: null });
    try {
      const response = await api.get(QUERY_ROUTES.GET_QUERY(queryId));
      const data = response.data;

      if (data.success) {
        set({ isQueryLoading: false });
        return { success: true, data: data.data.query };
      } else {
        set({ queryError: data.message, isQueryLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch query';
      set({ queryError: errorMsg, isQueryLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Admin: Get All Queries
  getAllQueries: async (filters = {}) => {
    set({ isAdminQueriesLoading: true, adminQueriesError: null });
    try {
      const response = await api.get(QUERY_ROUTES.ADMIN_ALL, { params: filters });
      const data = response.data;

      if (data.success) {
        set({
          adminQueries: data.data.queries,
          adminQueriesPagination: data.data.pagination,
          isAdminQueriesLoading: false,
        });
        return { success: true, data: data.data };
      } else {
        set({ adminQueriesError: data.message, isAdminQueriesLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch queries';
      set({ adminQueriesError: errorMsg, isAdminQueriesLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Admin: Update Query Status
  updateQueryStatus: async (queryId, statusData) => {
    set({ isAdminQueriesLoading: true, adminQueriesError: null });
    try {
      const response = await api.put(QUERY_ROUTES.ADMIN_UPDATE_STATUS(queryId), statusData);
      const data = response.data;

      if (data.success) {
        // Update query in the list
        set(state => ({
          adminQueries: state.adminQueries.map(query =>
            query._id === queryId ? data.data.query : query
          ),
          isAdminQueriesLoading: false,
        }));
        return { success: true, data: data.data.query };
      } else {
        set({ adminQueriesError: data.message, isAdminQueriesLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update query status';
      set({ adminQueriesError: errorMsg, isAdminQueriesLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Admin: Get Query Statistics
  getQueryStatistics: async () => {
    try {
      const response = await api.get(QUERY_ROUTES.ADMIN_STATISTICS);
      const data = response.data;

      if (data.success) {
        set({ queryStatistics: data.data });
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch statistics';
      return { success: false, error: errorMsg };
    }
  },

  // Clear Query State
  clearQueryState: () => {
    set({
      userQueries: [],
      adminQueries: [],
      queryStatistics: null,
    });
  },
});
