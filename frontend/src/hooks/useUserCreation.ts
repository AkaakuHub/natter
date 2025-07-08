import { useCallback } from "react";
import { UsersApi } from "@/api/users";
import { ExtendedSession } from "@/types";

interface UseUserCreationProps {
  session: ExtendedSession | null;
  checkUserExists: (twitterId: string) => Promise<void>;
  clearUserCache: (twitterId: string) => void;
}

interface UseUserCreationResult {
  createUserAndRefresh: () => Promise<void>;
}

export const useUserCreation = ({
  session,
  checkUserExists,
  clearUserCache,
}: UseUserCreationProps): UseUserCreationResult => {
  const createUserAndRefresh = useCallback(async () => {
    if (!session?.user?.id) {
      throw new Error("Session not available");
    }

    // console.log("Creating user with session:", session);
    // console.log("🔍 useUserCreation - session.user:", session.user);
    // console.log("🔍 useUserCreation - accessToken:", (session as any).accessToken);
    // console.log("🔍 useUserCreation - jwtToken:", (session as any).jwtToken);

    // セッションのトークンから直接名前を取得
    const extendedSession = session as ExtendedSession;
    const tokenName =
      extendedSession.accessToken?.name || extendedSession.jwtToken?.name;
    const tokenUsername =
      extendedSession.accessToken?.username ||
      extendedSession.jwtToken?.username;

    const userData = {
      twitterId: session.user.id,
      name:
        session.user.name ||
        tokenName ||
        tokenUsername ||
        session.user.email?.split("@")[0] ||
        `User_${session.user.id.slice(-8)}`,
      image: session.user.image || undefined,
    };

    // console.log("Creating user with data:", userData);
    await UsersApi.createUser(userData);
    // console.log("Created user:", createdUser);

    // キャッシュをクリアして新しいユーザー情報を取得
    const twitterId = session.user.id;
    clearUserCache(twitterId);

    // ユーザー作成後、再度チェック
    await checkUserExists(twitterId);
  }, [session, checkUserExists, clearUserCache]);

  return {
    createUserAndRefresh,
  };
};
