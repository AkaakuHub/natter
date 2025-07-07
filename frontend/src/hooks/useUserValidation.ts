import { useState, useCallback } from "react";
import { UsersApi } from "@/api/users";
import { User } from "@/api";
import { userCacheManager } from "@/utils/userCache";

interface UseUserValidationResult {
  currentUser: User | null;
  userExists: boolean | null;
  checkUserExists: (twitterId: string) => Promise<void>;
  clearUserCache: (twitterId: string) => void;
}

export const useUserValidation = (): UseUserValidationResult => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const clearUserCache = useCallback((twitterId: string) => {
    userCacheManager.clear(twitterId);
    setCurrentUser(null);
    setUserExists(null);
  }, []);

  const checkUserExists = useCallback(async (twitterId: string) => {
    if (!twitterId) {
      setCurrentUser(null);
      setUserExists(false);
      return;
    }

    // キャッシュから取得
    const cachedUser = userCacheManager.get(twitterId);
    if (cachedUser !== undefined) {
      setCurrentUser(cachedUser);
      setUserExists(!!cachedUser);
      return;
    }

    // 進行中のリクエストがある場合は待機
    if (userCacheManager.hasOngoingRequest(twitterId)) {
      try {
        const ongoingRequest = userCacheManager.getOngoingRequest(twitterId);
        if (ongoingRequest) {
          const user = await ongoingRequest;
          setCurrentUser(user);
          setUserExists(!!user);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setCurrentUser(null);
        setUserExists(false);
      }
      return;
    }

    // 新しいリクエストを開始
    try {
      const requestPromise = UsersApi.getUserByTwitterId(twitterId);
      userCacheManager.setOngoingRequest(twitterId, requestPromise);

      const user = await requestPromise;

      // キャッシュに保存
      userCacheManager.set(twitterId, user);
      setCurrentUser(user);
      setUserExists(!!user);

      // リクエスト完了後にクリーンアップ
      userCacheManager.clearOngoingRequest(twitterId);
    } catch (error) {
      console.error("Error checking user:", error);
      userCacheManager.set(twitterId, null);
      setCurrentUser(null);
      setUserExists(false);
      userCacheManager.clearOngoingRequest(twitterId);
    }
  }, []);

  return {
    currentUser,
    userExists,
    checkUserExists,
    clearUserCache,
  };
};