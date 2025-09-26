import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-slice";
import { createThemeSlice } from "./slices/theme-slice";
import { createPostsSlice } from "./slices/posts-slice";
import { createStoriesSlice } from "./slices/stories-slice";
import { createFriendsSlice } from "./slices/friends-slice";
import { createNotificationsSlice } from "./slices/notifications-slice";

export const useAppStore = create()((...a) => ({
  ...createAuthSlice(...a),
  ...createThemeSlice(...a),
  ...createPostsSlice(...a),
  ...createStoriesSlice(...a),
  ...createFriendsSlice(...a),
  ...createNotificationsSlice(...a),
}));
