import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JwtPayload {
  id: string;
  twitterId: string;
  name: string;
  image?: string;
  validated?: boolean;
  timestamp?: string;
}

interface AuthState {
  token: string | null;
  user: JwtPayload | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: JwtPayload) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<JwtPayload>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: JwtPayload) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userUpdate: Partial<JwtPayload>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...userUpdate,
            },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);