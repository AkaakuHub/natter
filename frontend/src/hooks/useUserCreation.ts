import { useCallback } from "react";
import { UsersApi } from "@/api/users";
import { ExtendedSession } from "@/types";

interface UseUserCreationProps {
  session: ExtendedSession | null;
  checkUserExists: (userId: string) => Promise<void>;
  clearUserCache: (userId: string) => void;
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
    if (!session.user.name) {
      throw new Error("Authenticated user name is missing");
    }

    const userData = {
      userId: session.user.id,
      name: session.user.name,
      image: session.user.image ?? null,
    };
    await UsersApi.createUser(userData);
    const userId = session.user.id;
    clearUserCache(userId);
    await checkUserExists(userId);
  }, [session, checkUserExists, clearUserCache]);

  return {
    createUserAndRefresh,
  };
};
