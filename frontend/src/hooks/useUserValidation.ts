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
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  const clearUserCache = useCallback((twitterId: string) => {
    userCacheManager.clear(twitterId);
    setCurrentUser(null);
    setUserExists(null);
    setIsNewUser(false); // 新規ユーザーフラグもリセット
  }, []);

  const checkUserExists = useCallback(
    async (twitterId: string) => {
      if (!twitterId) {
        setCurrentUser(null);
        setUserExists(false);
        return;
      }

      // 新規ユーザーと判定済みの場合はAPIコールをスキップ
      if (isNewUser) {
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
          // NetworkErrorの場合はログを出力しない（サーバーダウン時の騒音を防ぐ）
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const errorName =
            error instanceof Error ? error.constructor.name : "Unknown";

          if (!errorMessage.includes("サーバーに接続できません")) {
            console.error("Error checking user (ongoing request):", error);
          }

          if (
            errorMessage.includes("サーバーに接続できません") ||
            errorMessage.includes("Failed to fetch") ||
            errorMessage.includes("ERR_CONNECTION_REFUSED") ||
            errorName === "NetworkError"
          ) {
            setCurrentUser(null);
            setUserExists(null); // 判定保留
          } else {
            setCurrentUser(null);
            setUserExists(false);
          }
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
        // NetworkErrorの場合はログを出力しない（サーバーダウン時の騒音を防ぐ）
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorName =
          error instanceof Error ? error.constructor.name : "Unknown";

        if (!errorMessage.includes("サーバーに接続できません")) {
          console.error("Error checking user:", error);
        }

        if (
          errorMessage.includes("サーバーに接続できません") ||
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("ERR_CONNECTION_REFUSED") ||
          errorName === "NetworkError"
        ) {
          // サーバーダウンの場合は状態をリセットして判定を保留
          setCurrentUser(null);
          setUserExists(null); // 判定保留
          setIsNewUser(false);
        } else {
          // その他のエラー（404など）の場合は新規ユーザーとして扱う
          setCurrentUser(null);
          setUserExists(false);
          setIsNewUser(true);
        }

        userCacheManager.clearOngoingRequest(twitterId);
      }
    },
    [isNewUser],
  );

  return {
    currentUser,
    userExists,
    checkUserExists,
    clearUserCache,
  };
};
