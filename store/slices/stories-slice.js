import api from '../../utils/api';
import { STORIES_ROUTES } from '../../utils/constants';

export const createStoriesSlice = (set, get) => ({
  // Stories State
  storyGroups: [],
  myStories: [],
  currentStoryGroup: null,
  currentStoryIndex: 0,
  isStoriesLoading: false,
  error: null,

  // Actions
  setStoryGroups: (storyGroups) => set({ storyGroups }),
  setMyStories: (myStories) => set({ myStories }),
  setCurrentStoryGroup: (storyGroup) => set({ currentStoryGroup: storyGroup }),
  setCurrentStoryIndex: (index) => set({ currentStoryIndex: index }),
  setIsStoriesLoading: (isStoriesLoading) => set({ isStoriesLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Get stories (friends + own)
  getStories: async () => {
    set({ isStoriesLoading: true, error: null });

    try {
      const response = await api.get(STORIES_ROUTES.GET_STORIES);
      const data = response.data;

      if (data.success) {
        set({ 
          storyGroups: data.data.storyGroups, 
          isStoriesLoading: false, 
          error: null 
        });

        return { success: true, data: data.data.storyGroups };
      } else {
        set({ error: data.message, isStoriesLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch stories';
      set({ error: errorMessage, isStoriesLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get my stories
  getMyStories: async () => {
    set({ isStoriesLoading: true, error: null });

    try {
      const response = await api.get(STORIES_ROUTES.GET_MY_STORIES);
      const data = response.data;

      if (data.success) {
        set({ 
          myStories: data.data.stories, 
          isStoriesLoading: false, 
          error: null 
        });

        return { success: true, data: data.data.stories };
      } else {
        set({ error: data.message, isStoriesLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch my stories';
      set({ error: errorMessage, isStoriesLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get user stories
  getUserStories: async (userId) => {
    set({ isStoriesLoading: true, error: null });

    try {
      const response = await api.get(STORIES_ROUTES.GET_USER_STORIES(userId));
      const data = response.data;

      if (data.success) {
        set({ isStoriesLoading: false, error: null });
        return { success: true, data: data.data.stories };
      } else {
        set({ error: data.message, isStoriesLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user stories';
      set({ error: errorMessage, isStoriesLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get story by ID
  getStoryById: async (storyId) => {
    try {
      const response = await api.get(STORIES_ROUTES.GET_STORY(storyId));
      const data = response.data;

      if (data.success) {
        return { success: true, data: data.data.story };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch story';
      return { success: false, error: errorMessage };
    }
  },

  // Create a new story
  createStory: async (storyData) => {
    set({ isStoriesLoading: true, error: null });

    try {
      const formData = new FormData();

      // Add caption if provided
      if (storyData.caption) {
        formData.append('caption', storyData.caption);
      }

      // Add media file
      formData.append('mediaFile', {
        uri: storyData.mediaFile.uri,
        type: storyData.mediaFile.type,
        name: storyData.mediaFile.name || `story.${storyData.mediaFile.type.split('/')[1]}`
      });

      const response = await api.post(STORIES_ROUTES.CREATE_STORY, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = response.data;

      if (data.success) {
        // Add the new story to my stories
        const { myStories } = get();
        set({ 
          myStories: [data.data.story, ...myStories],
          isStoriesLoading: false, 
          error: null 
        });

        // Refresh stories to update the main feed
        await get().getStories();

        return { success: true, data: data.data.story };
      } else {
        set({ error: data.message, isStoriesLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create story';
      set({ error: errorMessage, isStoriesLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete story
  deleteStory: async (storyId) => {
    set({ isStoriesLoading: true, error: null });

    try {
      const response = await api.delete(STORIES_ROUTES.DELETE_STORY(storyId));
      const data = response.data;

      if (data.success) {
        // Remove the story from my stories
        const { myStories, storyGroups } = get();
        const updatedMyStories = myStories.filter(story => story._id !== storyId);

        // Update story groups as well
        const updatedStoryGroups = storyGroups.map(group => ({
          ...group,
          stories: group.stories.filter(story => story._id !== storyId)
        })).filter(group => group.stories.length > 0);

        set({ 
          myStories: updatedMyStories,
          storyGroups: updatedStoryGroups,
          isStoriesLoading: false, 
          error: null 
        });

        return { success: true };
      } else {
        set({ error: data.message, isStoriesLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete story';
      set({ error: errorMessage, isStoriesLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Toggle like on story
  toggleLikeStory: async (storyId) => {
    try {
      const response = await api.post(STORIES_ROUTES.TOGGLE_LIKE(storyId));
      const data = response.data;

      if (data.success) {
        // Update the story in story groups
        const { storyGroups, currentStoryGroup } = get();
        const updatedStoryGroups = storyGroups.map(group => ({
          ...group,
          stories: group.stories.map(story => {
            if (story._id === storyId) {
              return {
                ...story,
                isLikedByCurrentUser: data.data.isLiked,
                likesCount: data.data.likesCount
              };
            }
            return story;
          })
        }));

        // Update current story group if it's being viewed
        let updatedCurrentStoryGroup = currentStoryGroup;
        if (currentStoryGroup) {
          updatedCurrentStoryGroup = {
            ...currentStoryGroup,
            stories: currentStoryGroup.stories.map(story => {
              if (story._id === storyId) {
                return {
                  ...story,
                  isLikedByCurrentUser: data.data.isLiked,
                  likesCount: data.data.likesCount
                };
              }
              return story;
            })
          };
        }

        set({ 
          storyGroups: updatedStoryGroups,
          currentStoryGroup: updatedCurrentStoryGroup
        });

        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle like';
      return { success: false, error: errorMessage };
    }
  },

  // Get story viewers (for own stories)
  getStoryViewers: async (storyId) => {
    try {
      const response = await api.get(STORIES_ROUTES.GET_VIEWERS(storyId));
      const data = response.data;

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch viewers';
      return { success: false, error: errorMessage };
    }
  },

  // Navigate to next story in current group
  nextStory: () => {
    const { currentStoryGroup, currentStoryIndex } = get();
    
    if (currentStoryGroup && currentStoryIndex < currentStoryGroup.stories.length - 1) {
      set({ currentStoryIndex: currentStoryIndex + 1 });
      return true; // Successfully moved to next story
    }
    return false; // No more stories in this group
  },

  // Navigate to previous story in current group
  previousStory: () => {
    const { currentStoryIndex } = get();
    
    if (currentStoryIndex > 0) {
      set({ currentStoryIndex: currentStoryIndex - 1 });
      return true; // Successfully moved to previous story
    }
    return false; // Already at first story
  },

  // Set up story viewing
  startViewingStories: (storyGroup, startIndex = 0) => {
    set({ 
      currentStoryGroup: storyGroup, 
      currentStoryIndex: startIndex 
    });
  },

  // Stop viewing stories
  stopViewingStories: () => {
    set({ 
      currentStoryGroup: null, 
      currentStoryIndex: 0 
    });
  },

  // Clear stories (for logout)
  clearStories: () => {
    set({
      storyGroups: [],
      myStories: [],
      currentStoryGroup: null,
      currentStoryIndex: 0,
      isStoriesLoading: false,
      error: null
    });
  }
});