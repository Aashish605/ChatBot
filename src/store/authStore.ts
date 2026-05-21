import { create } from "zustand";

type User = {
  id: string;
  email?: string;
};

type AuthStore = {
  user: User | null;

  setUser: (user: User | null) => void;

  clearUser: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  setUser: (user) =>
    set({
      user,
    }),

  clearUser: () =>
    set({
      user: null,
    }),
}));