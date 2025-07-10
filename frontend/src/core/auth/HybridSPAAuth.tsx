"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";
import { performCompleteLogout } from "@/utils/logout";
import type { User, Session } from "next-auth";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  isHydrated: boolean;
}

interface HybridSPAAuthContextType extends AuthState {
  requireAuth: () => boolean;
  logout: () => void;
  redirectToLogin: () => void;
  redirectAfterLogin: () => void;
  isInitialLoad: boolean;
}

const HybridSPAAuthContext = createContext<HybridSPAAuthContextType | null>(
  null,
);

export const useHybridSPAAuth = () => {
  const context = useContext(HybridSPAAuthContext);
  if (!context) {
    throw new Error(
      "useHybridSPAAuth must be used within HybridSPAAuthProvider",
    );
  }
  return context;
};

interface HybridSPAAuthProviderProps {
  children: React.ReactNode;
}

export const HybridSPAAuthProvider: React.FC<HybridSPAAuthProviderProps> = ({
  children,
}) => {
  const { data: session, status } = useSession();
  const { currentRoute, navigate, routeEngine } = useTrueSPARouter();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    session: null,
    isHydrated: false,
  });

  const [redirectAfterAuth, setRedirectAfterAuth] = useState<string | null>(
    null,
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Hydration状態の管理
  useEffect(() => {
    setAuthState((prev) => ({ ...prev, isHydrated: true }));
    setIsInitialLoad(false);
  }, []);

  // 認証状態の更新
  useEffect(() => {
    const isAuthenticated = status === "authenticated";
    const isLoading = status === "loading";

    setAuthState((prev) => ({
      ...prev,
      isAuthenticated,
      isLoading,
      user: session?.user || null,
      session: session || null,
    }));
  }, [session, status]);

  // 認証が必要かチェック
  const requireAuth = useCallback((): boolean => {
    if (!currentRoute) return false;

    // ログインページは認証不要
    if (currentRoute.path === "/login") return false;

    // 初回ロードの場合はSSRで処理済み
    if (isInitialLoad) return false;

    // ルートエンジンから認証要件を取得
    return routeEngine.isAuthRequired(currentRoute.path);
  }, [currentRoute, routeEngine, isInitialLoad]);

  // ログインページにリダイレクト
  const redirectToLogin = useCallback(() => {
    if (currentRoute && currentRoute.path !== "/login") {
      setRedirectAfterAuth(currentRoute.path);
    }

    // 初回ロードの場合は通常のリダイレクト
    if (isInitialLoad || !authState.isHydrated) {
      window.location.href = "/login";
    } else {
      navigate("/login", { replace: true });
    }
  }, [currentRoute, navigate, isInitialLoad, authState.isHydrated]);

  // ログイン後のリダイレクト
  const redirectAfterLogin = useCallback(() => {
    const destination = redirectAfterAuth || "/";
    setRedirectAfterAuth(null);

    // 初回ロードの場合は通常のリダイレクト
    if (isInitialLoad || !authState.isHydrated) {
      window.location.href = destination;
    } else {
      navigate(destination, { replace: true });
    }
  }, [redirectAfterAuth, navigate, isInitialLoad, authState.isHydrated]);

  // ログアウト
  const logout = useCallback(async () => {
    console.log(
      "🔥 [HybridSPAAuth] Logout called, performing complete logout...",
    );
    setRedirectAfterAuth(null);
    await performCompleteLogout();
  }, []);

  // 認証状態変化時の自動リダイレクト（hydration後のみ）
  useEffect(() => {
    if (authState.isLoading || !authState.isHydrated || isInitialLoad) return;

    const needsAuth = requireAuth();

    if (needsAuth && !authState.isAuthenticated) {
      // 認証が必要だが未認証の場合
      redirectToLogin();
    } else if (authState.isAuthenticated && currentRoute?.path === "/login") {
      // 認証済みだがログインページにいる場合
      redirectAfterLogin();
    }
  }, [
    authState.isAuthenticated,
    authState.isLoading,
    authState.isHydrated,
    isInitialLoad,
    requireAuth,
    redirectToLogin,
    redirectAfterLogin,
    currentRoute,
  ]);

  const contextValue: HybridSPAAuthContextType = {
    ...authState,
    requireAuth,
    logout,
    redirectToLogin,
    redirectAfterLogin,
    isInitialLoad,
  };

  return (
    <HybridSPAAuthContext.Provider value={contextValue}>
      {children}
    </HybridSPAAuthContext.Provider>
  );
};
