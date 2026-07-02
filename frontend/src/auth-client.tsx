"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthSession } from "@/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  data: AuthSession | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = async () => {
    setStatus("loading");
    const response = await fetch("/api/link-auth/session", {
      cache: "no-store",
      credentials: "include",
    });
    if (response.status === 401) {
      setData(null);
      setStatus("unauthenticated");
      return;
    }
    if (!response.ok) {
      throw new Error("Failed to load auth session");
    }
    const session = (await response.json()) as AuthSession;
    setData(session);
    setStatus("authenticated");
  };

  useEffect(() => {
    refresh().catch(() => {
      setData(null);
      setStatus("unauthenticated");
    });
  }, []);

  const value = useMemo(
    () => ({
      data,
      status,
      refresh,
    }),
    [data, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthSession must be used within AuthProvider");
  }
  return context;
}
