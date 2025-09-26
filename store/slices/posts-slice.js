import api from "../../utils/api";
import { POSTS_ROUTES } from "../../utils/constants";

export const createPostsSlice = (set, get) => ({
  // Posts State
  posts: [],
  currentPost: null,
  comments: [],
  isPostsLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  // Actions
  setPosts: (posts) => set({ posts }),
  setCurrentPost: (post) => set({ currentPost: post }),
  setComments: (comments) => set({ comments }),
  setisPoastLoading: (isPoastLoading) => set({ isPoastLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setHasMore: (hasMore) => set({ hasMore }),
  setCurrentPage: (page) => set({ currentPage: page }),

  // Get posts with pagination
  getPosts: async (page = 1, userId = null) => {
    const { currentPage, posts } = get();

    // If it's page 1, show loading and reset posts
    if (page === 1) {
      set({ isPoastLoading: true, error: null, posts: [], currentPage: 1 });
    }

    try {
      const params = {
        page,
        limit: 10,
        ...(userId && { userId }),
      };

      const response = await api.get(POSTS_ROUTES.GET_POSTS, { params });
      const data = response.data;

      if (data.success) {
        const newPosts = data.data.posts;
        const pagination = data.data.pagination;

        // If it's page 1, replace posts; otherwise append
        const updatedPosts = page === 1 ? newPosts : [...posts, ...newPosts];

        set({
          posts: updatedPosts,
          hasMore: pagination.hasMore,
          currentPage: page,
          isPoastLoading: false,
          error: null,
        });

        return { success: true, data: newPosts };
      } else {
        set({ error: data.message, isPoastLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch posts";
      set({ error: errorMessage, isPoastLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Load more posts (infinite scroll)
  loadMorePosts: async (userId = null) => {
    const { currentPage, hasMore, isPostLoading } = get();

    if (!hasMore || isPostLoading) return;

    return await get().getPosts(currentPage + 1, userId);
  },

  // Get a specific post
  getPostById: async (postId) => {
    set({ isPostsLoading: true, error: null });

    try {
      const response = await api.get(POSTS_ROUTES.GET_POST(postId));
      const data = response.data;

      if (data.success) {
        set({ currentPost: data.data.post, isPostsLoading: false, error: null });
        return { success: true, data: data.data.post };
      } else {
        set({ error: data.message, isPostsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch post";
      set({ error: errorMessage, isPostsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Create a new post
  createPost: async (postData) => {
    set({ isPostsLoading: true, error: null });

    try {
      const formData = new FormData();

      // Add text fields
      if (postData.description) {
        formData.append("description", postData.description);
      }
      if (postData.location) {
        formData.append("location", JSON.stringify(postData.location));
      }
      if (postData.taggedFriends) {
        formData.append(
          "taggedFriends",
          JSON.stringify(postData.taggedFriends)
        );
      }

      // Add media files
      postData.mediaFiles?.forEach((file, index) => {
        formData.append("mediaFiles", {
          uri: file.uri,
          type: file.type,
          name: file.name || `media_${index}.${file.type.split("/")[1]}`,
        });
      });

      const response = await api.post(POSTS_ROUTES.CREATE_POST, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      if (data.success) {
        // Add the new post to the beginning of the posts array
        const { posts } = get();
        set({
          posts: [data.data.post, ...posts],
          isPostsLoading: false,
          error: null,
        });

        return { success: true, data: data.data.post };
      } else {
        set({ error: data.message, isPostsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create post";
      set({ error: errorMessage, isPostsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update post
  updatePost: async (postId, updates) => {
    set({ isPostsLoading: true, error: null });

    try {
      const response = await api.put(POSTS_ROUTES.UPDATE_POST(postId), updates);
      const data = response.data;

      if (data.success) {
        // Update the post in the posts array
        const { posts } = get();
        const updatedPosts = posts.map((post) =>
          post._id === postId ? { ...post, ...data.data.post } : post
        );

        set({
          posts: updatedPosts,
          currentPost: data.data.post,
          isPostsLoading: false,
          error: null,
        });

        return { success: true, data: data.data.post };
      } else {
        set({ error: data.message, isPostsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update post";
      set({ error: errorMessage, isPostsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete post
  deletePost: async (postId) => {
    set({ isPostsLoading: true, error: null });

    try {
      const response = await api.delete(POSTS_ROUTES.DELETE_POST(postId));
      const data = response.data;

      if (data.success) {
        // Remove the post from the posts array
        const { posts } = get();
        const updatedPosts = posts.filter((post) => post._id !== postId);

        set({ posts: updatedPosts, isPostsLoading: false, error: null });
        return { success: true };
      } else {
        set({ error: data.message, isPostsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete post";
      set({ error: errorMessage, isPostsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Toggle like on post
  toggleLikePost: async (postId) => {
    try {
      const response = await api.post(POSTS_ROUTES.TOGGLE_LIKE(postId));
      const data = response.data;

      if (data.success) {
        // Update the post in the posts array
        const { posts, currentPost } = get();
        const updatedPosts = posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              isLikedByCurrentUser: data.data.isLiked,
              likesCount: data.data.likesCount,
            };
          }
          return post;
        });

        // Update current post if it matches
        let updatedCurrentPost = currentPost;
        if (currentPost && currentPost._id === postId) {
          updatedCurrentPost = {
            ...currentPost,
            isLikedByCurrentUser: data.data.isLiked,
            likesCount: data.data.likesCount,
          };
        }

        set({
          posts: updatedPosts,
          currentPost: updatedCurrentPost,
        });

        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to toggle like";
      return { success: false, error: errorMessage };
    }
  },

  // Add comment to post
  addComment: async (postId, text) => {
    try {
      const response = await api.post(POSTS_ROUTES.ADD_COMMENT(postId), {
        text,
      });
      const data = response.data;

      if (data.success) {
        // Update the post's comment count in the posts array
        const { posts, currentPost, comments } = get();
        const updatedPosts = posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              commentsCount: data.data.commentsCount,
            };
          }
          return post;
        });

        // Update current post if it matches
        let updatedCurrentPost = currentPost;
        if (currentPost && currentPost._id === postId) {
          updatedCurrentPost = {
            ...currentPost,
            commentsCount: data.data.commentsCount,
          };
        }

        // Add comment to comments array
        const updatedComments = [data.data.comment, ...comments];

        set({
          posts: updatedPosts,
          currentPost: updatedCurrentPost,
          comments: updatedComments,
        });

        return { success: true, data: data.data.comment };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add comment";
      return { success: false, error: errorMessage };
    }
  },

  // Get comments for a post
  getComments: async (postId, page = 1) => {
    if (page === 1) {
      set({ isPostsLoading: true, error: null, comments: [] });
    }

    try {
      const response = await api.get(POSTS_ROUTES.GET_COMMENTS(postId), {
        params: { page, limit: 20 },
      });
      const data = response.data;

      if (data.success) {
        const { comments } = get();
        const newComments =
          page === 1
            ? data.data.comments
            : [...comments, ...data.data.comments];

        set({
          comments: newComments,
          isPostsLoading: false,
          error: null,
        });

        return {
          success: true,
          data: data.data.comments,
          hasMore: data.data.pagination.hasMore,
        };
      } else {
        set({ error: data.message, isPostsLoading: false });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch comments";
      set({ error: errorMessage, isPostsLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Clear posts (for logout or refresh)
  clearPosts: () => {
    set({
      posts: [],
      currentPost: null,
      comments: [],
      isPostsLoading: false,
      error: null,
      hasMore: true,
      currentPage: 1,
    });
  },
});
