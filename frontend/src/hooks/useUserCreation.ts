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

    const userData = {
      twitterId: session.user.id,
      name: session.user.name || "Unknown User",
      image: session.user.image || undefined,
    };

    console.log("Creating user with data:", userData);
    const createdUser = await UsersApi.createUser(userData);
    console.log("Created user:", createdUser);

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
