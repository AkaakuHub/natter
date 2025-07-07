import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ExtendedSession } from "@/types";
import { User } from "@/api";
import { userCacheManager } from "@/utils/userCache";

interface UseSessionManagementProps {
  checkUserExists: (twitterId: string) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  setUserExists: (exists: boolean) => void;
}

interface UseSessionManagementResult {
  session: ExtendedSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useSessionManagement = ({
  checkUserExists,
  setCurrentUser,
  setUserExists,
}: UseSessionManagementProps): UseSessionManagementResult => {
  const { data: session, status } = useSession();
  const isInitializedRef = useRef(false);
  const lastSessionIdRef = useRef<string | undefined>(undefined);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session;

  useEffect(() => {
    const run = async () => {
      // 初期化フラグで重複実行を防ぐ
      if (status === "loading") {
        return;
      }

      if (status === "authenticated" && session?.user?.id) {
        const userId = session.user.id;

        // 同じセッションIDの場合は再実行しない
        if (lastSessionIdRef.current === userId) {
          return;
        }

        // キャッシュまたは進行中のリクエストをチェック
        const cachedUser = userCacheManager.get(userId);
        if (cachedUser !== undefined) {
          setCurrentUser(cachedUser);
          setUserExists(!!cachedUser);
          lastSessionIdRef.current = userId;
          return; // すでに処理済み
        }

        if (userCacheManager.hasOngoingRequest(userId)) {
          lastSessionIdRef.current = userId;
          return; // 処理中
        }

        if (
          !isInitializedRef.current ||
          lastSessionIdRef.current !== userId
        ) {
          isInitializedRef.current = true;
          lastSessionIdRef.current = userId;
          checkUserExists(userId);
        }
      } else if (status === "unauthenticated") {
        isInitializedRef.current = false;
        lastSessionIdRef.current = undefined;
        setCurrentUser(null);
        setUserExists(false);
      }
    };
    run();
  }, [session?.user?.id, status, checkUserExists, setCurrentUser, setUserExists]);

  return {
    session: session as ExtendedSession | null,
    isLoading,
    isAuthenticated,
  };
};