import api from '../../utils/api';
import { FRIENDS_ROUTES } from '../../utils/constants';

export const createFriendsSlice = (set, get) => ({
  // Friends State
  friends: [],
  friendRequests: [],
  sentRequests: [],
  searchResults: [],
  isFriendsLoading: false,
  error: null,
  searchQuery: '',

  // Actions
  setFriends: (friends) => set({ friends }),
  setFriendRequests: (friendRequests) => set({ friendRequests }),
  setSentRequests: (sentRequests) => set({ sentRequests }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setIsFriendsLoading: (isFriendsLoading) => set({ isFriendsLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Send friend request
  sendFriendRequest: async (recipientId) => {
    set({ isFriendsLoading: true, error: null });

    try {
      const response = await api.post(FRIENDS_ROUTES.SEND_REQUEST, {
        recipientId
      });
      const data = response.data;

      if (data.success) {
        // Update search results to reflect the sent request
        const { searchResults } = get();
        const updatedSearchResults = searchResults.map(user => {
          if (user._id === recipientId) {
            return {
              ...user,
              friendshipStatus: 'pending',
              friendshipId: data.data.friendRequest._id,
              isRequester: true
            };
          }
          return user;
        });

        // Add to sent requests
        const { sentRequests } = get();
        const newRequest = {
          ...data.data.friendRequest,
          recipient: searchResults.find(user => user._id === recipientId)
        };

        set({
          searchResults: updatedSearchResults,
          sentRequests: [newRequest, ...sentRequests],
          isFriendsLoading: false,
          error: null
        });

        return { success: true, data: data.data.friendRequest };
      } else {
        set({ error: data.message, isFriendsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send friend request';
      set({ error: errorMessage, isFriendsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Respond to friend request (accept/decline)
  respondToFriendRequest: async (friendshipId, action) => {
    set({ isFriendsLoading: true, error: null });

    try {
      const response = await api.put(FRIENDS_ROUTES.RESPOND_REQUEST(friendshipId), {
        action
      });
      const data = response.data;

      if (data.success) {
        const { friendRequests, friends } = get();
        
        // Remove from friend requests
        const updatedRequests = friendRequests.filter(req => req._id !== friendshipId);
        
        // If accepted, add to friends list
        let updatedFriends = friends;
        if (action === 'accept') {
          const acceptedRequest = friendRequests.find(req => req._id === friendshipId);
          if (acceptedRequest) {
            updatedFriends = [{
              ...acceptedRequest.requester,
              friendshipId: friendshipId,
              friendsSince: new Date()
            }, ...friends];
          }
        }

        set({
          friendRequests: updatedRequests,
          friends: updatedFriends,
          isFriendsLoading: false,
          error: null
        });

        return { success: true, data: data.data.friendship };
      } else {
        set({ error: data.message, isFriendsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to respond to friend request';
      set({ error: errorMessage, isFriendsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get friend requests
  getFriendRequests: async () => {
    set({ isFriendsLoading: true, error: null });

    try {
      const response = await api.get(FRIENDS_ROUTES.GET_REQUESTS);
      const data = response.data;

      if (data.success) {
        set({
          friendRequests: data.data.friendRequests,
          isFriendsLoading: false,
          error: null
        });

        return { success: true, data: data.data.friendRequests };
      } else {
        set({ error: data.message, isFriendsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch friend requests';
      set({ error: errorMessage, isFriendsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get sent friend requests
  getSentFriendRequests: async () => {
    set({ isFriendsLoading: true, error: null });

    try {
      const response = await api.get(FRIENDS_ROUTES.GET_SENT_REQUESTS);
      const data = response.data;

      if (data.success) {
        set({
          sentRequests: data.data.sentRequests,
          isFriendsLoading: false,
          error: null
        });

        return { success: true, data: data.data.sentRequests };
      } else {
        set({ error: data.message, isFriendsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch sent requests';
      set({ error: errorMessage, isFriendsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get friends list
  getFriends: async (page = 1) => {
    if (page === 1) {
      set({ isFriendsLoading: true, error: null });
    }

    try {
      const response = await api.get(FRIENDS_ROUTES.GET_FRIENDS, {
        params: { page, limit: 20 }
      });
      const data = response.data;

      if (data.success) {
        const { friends } = get();
        const newFriends = page === 1 ? data.data.friends : [...friends, ...data.data.friends];

        set({
          friends: newFriends,
          isFriendsLoading: false,
          error: null
        });

        return { 
          success: true, 
          data: data.data.friends,
          hasMore: data.data.pagination.hasMore 
        };
      } else {
        set({ error: data.message, isFriendsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch friends';
      set({ error: errorMessage, isFriendsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Remove friend
  removeFriend: async (friendId) => {
    set({ isFriendsLoading: true, error: null });

    try {
      const response = await api.delete(FRIENDS_ROUTES.REMOVE_FRIEND(friendId));
      const data = response.data;

      if (data.success) {
        // Remove from friends list
        const { friends } = get();
        const updatedFriends = friends.filter(friend => friend._id !== friendId);

        set({
          friends: updatedFriends,
          isFriendsLoading: false,
          error: null
        });

        return { success: true };
      } else {
        set({ error: data.message, isFriendsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove friend';
      set({ error: errorMessage, isFriendsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Search users
  searchUsers: async (query, page = 1) => {
    if (page === 1) {
      set({ isFriendsLoading: true, error: null, searchQuery: query });
    }

    if (!query || query.trim() === '') {
      set({ searchResults: [], isFriendsLoading: false });
      return { success: true, data: [] };
    }

    try {
      const response = await api.get(FRIENDS_ROUTES.SEARCH_USERS, {
        params: { query: query.trim(), page, limit: 20 }
      });
      const data = response.data;

      if (data.success) {
        const { searchResults } = get();
        const newResults = page === 1 ? data.data.users : [...searchResults, ...data.data.users];

        set({
          searchResults: newResults,
          isFriendsLoading: false,
          error: null
        });

        return { 
          success: true, 
          data: data.data.users,
          hasMore: data.data.pagination.hasMore 
        };
      } else {
        set({ error: data.message, isFriendsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to search users';
      set({ error: errorMessage, isFriendsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get friendship status with a user
  getFriendshipStatus: async (userId) => {
    try {
      const response = await api.get(FRIENDS_ROUTES.GET_FRIENDSHIP_STATUS(userId));
      const data = response.data;

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get friendship status';
      return { success: false, error: errorMessage };
    }
  },

  // Clear search results
  clearSearchResults: () => {
    set({ searchResults: [], searchQuery: '' });
  },

  // Clear friends data (for logout)
  clearFriendsData: () => {
    set({
      friends: [],
      friendRequests: [],
      sentRequests: [],
      searchResults: [],
      isFriendsLoading: false,
      error: null,
      searchQuery: ''
    });
  }
});