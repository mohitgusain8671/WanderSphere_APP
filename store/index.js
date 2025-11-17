import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-slice";
import { createThemeSlice } from "./slices/theme-slice";
import { createPostsSlice } from "./slices/posts-slice";
import { createStoriesSlice } from "./slices/stories-slice";
import { createFriendsSlice } from "./slices/friends-slice";
import { createNotificationsSlice } from "./slices/notifications-slice";
import { createWanderlustSlice } from "./slices/wanderlust-slice";
import { createItinerarySlice } from "./slices/itinerary-slice";
import { createMessageSlice } from "./slices/message-slice";
import { createAdminSlice } from "./slices/admin-slice";
import { createQuerySlice } from "./slices/query-slice";
import { createQuizSlice } from "./slices/quiz-slice";
import { createContestSlice } from "./slices/contest-slice";
import { createLeaderboardSlice } from "./slices/leaderboard-slice";
import { createBuddySlice } from "./slices/buddy-slice";

export const useAppStore = create()((...a) => ({
  ...createAuthSlice(...a),
  ...createThemeSlice(...a),
  ...createPostsSlice(...a),
  ...createStoriesSlice(...a),
  ...createFriendsSlice(...a),
  ...createNotificationsSlice(...a),
  ...createWanderlustSlice(...a),
  ...createItinerarySlice(...a),
  ...createMessageSlice(...a),
  ...createAdminSlice(...a),
  ...createQuerySlice(...a),
  ...createQuizSlice(...a),
  ...createContestSlice(...a),
  ...createLeaderboardSlice(...a),
  ...createBuddySlice(...a),
}));
