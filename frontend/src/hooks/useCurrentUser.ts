import { useState } from "react";
import { User } from "@/api";
import { ExtendedSession } from "@/types";
import { useUserValidation } from "@/hooks/useUserValidation";
import { useUserCreation } from "@/hooks/useUserCreation";
import { useSessionManagement } from "@/hooks/useSessionManagement";

interface UseCurrentUserReturn {
  currentUser: User | null;
  session: ExtendedSession | null;
  userExists: boolean | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  createUserAndRefresh: () => Promise<void>;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  const [internalCurrentUser, setInternalCurrentUser] = useState<User | null>(
    null,
  );
  const [internalUserExists, setInternalUserExists] = useState<boolean | null>(
    null,
  );

  const {
    currentUser: validatedUser,
    userExists: validatedUserExists,
    checkUserExists,
    clearUserCache,
  } = useUserValidation();

  const {
    session,
    isLoading: sessionLoading,
    isAuthenticated,
  } = useSessionManagement({
    checkUserExists,
    setCurrentUser: setInternalCurrentUser,
    setUserExists: setInternalUserExists,
  });

  const { createUserAndRefresh } = useUserCreation({
    session,
    checkUserExists,
    clearUserCache,
  });

  // Use validated user state if available, otherwise use internal state
  const currentUser =
    validatedUser !== null ? validatedUser : internalCurrentUser;
  const userExists =
    validatedUserExists !== null ? validatedUserExists : internalUserExists;
  const isLoading = sessionLoading || userExists === null;

  console.log("👤 useCurrentUser state:", {
    currentUser: currentUser?.id || null,
    userExists,
    isLoading,
    isAuthenticated,
    session: session?.user?.id || null,
  });

  return {
    currentUser,
    session,
    userExists,
    isLoading,
    isAuthenticated,
    createUserAndRefresh,
  };
};
