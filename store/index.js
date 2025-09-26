import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-slice";
import { createThemeSlice } from "./slices/theme-slice";

export const useAppStore = create()((...a) => ({
  ...createAuthSlice(...a),
  ...createThemeSlice(...a),
}));