import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { UsersApi } from '@/api/users';
import { User } from '@/api';
import { ExtendedSession } from '@/types';

// グローバルなキャッシュとリクエスト管理
const userCache: { [twitterId: string]: User | null } = {};
const ongoingRequests: { [twitterId: string]: Promise<User | null> } = {};

interface UseCurrentUserReturn {
  currentUser: User | null;
  session: ExtendedSession | null;
  userExists: boolean | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  createUserAndRefresh: () => Promise<void>;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const isInitializedRef = useRef(false);
  const lastSessionIdRef = useRef<string | undefined>(undefined);

  const isLoading = status === 'loading' || userExists === null;
  const isAuthenticated = status === 'authenticated' && !!session;

  // ユーザーの存在をチェック（キャッシュ機能付き）
  const checkUserExists = useCallback(async () => {
    if (!session?.user?.id) {
      setCurrentUser(null);
      setUserExists(false);
      return;
    }

    const twitterId = session.user.id;

    // キャッシュから取得
    if (userCache[twitterId] !== undefined) {
      const cachedUser = userCache[twitterId];
      setCurrentUser(cachedUser);
      setUserExists(!!cachedUser);
      return;
    }

    // 進行中のリクエストがある場合は待機
    if (await ongoingRequests[twitterId]) {
      try {
        const user = await ongoingRequests[twitterId];
        setCurrentUser(user);
        setUserExists(!!user);
      } catch (error) {
        console.error('Error checking user:', error);
        setCurrentUser(null);
        setUserExists(false);
      }
      return;
    }

    // 新しいリクエストを開始
    try {
      const requestPromise = UsersApi.getUserByTwitterId(twitterId);
      ongoingRequests[twitterId] = requestPromise;
      
      const user = await requestPromise;
      
      // キャッシュに保存
      userCache[twitterId] = user;
      setCurrentUser(user);
      setUserExists(!!user);
      
      // リクエスト完了後にクリーンアップ
      delete ongoingRequests[twitterId];
    } catch (error) {
      console.error('Error checking user:', error);
      userCache[twitterId] = null;
      setCurrentUser(null);
      setUserExists(false);
      delete ongoingRequests[twitterId];
    }
  }, [session?.user?.id]);

  // ユーザー作成後にリフレッシュ
  const createUserAndRefresh = async () => {
    if (!session?.user?.id) {
      throw new Error('Session not available');
    }

    const userData = {
      twitterId: session.user.id,
      name: session.user.name || "Unknown User",
      image: session.user.image || undefined,
    };

    console.log('Creating user with data:', userData);
    const createdUser = await UsersApi.createUser(userData);
    console.log('Created user:', createdUser);

    // キャッシュをクリアして新しいユーザー情報を取得
    const twitterId = session.user.id;
    delete userCache[twitterId];
    delete ongoingRequests[twitterId];
    
    // ユーザー作成後、再度チェック
    await checkUserExists();
  };

  useEffect(() => {
    const run = async () => {
      // 初期化フラグで重複実行を防ぐ
      if (status === 'loading') {
        return;
      }
      
      if (status === 'authenticated' && session?.user?.id) {
        const userId = session.user.id;
        
        // 同じセッションIDの場合は再実行しない
        if (lastSessionIdRef.current === userId) {
          return;
        }
        
        // キャッシュまたは進行中のリクエストをチェック
        if (userCache[userId] !== undefined) {
          const cachedUser = userCache[userId];
          setCurrentUser(cachedUser);
          setUserExists(!!cachedUser);
          lastSessionIdRef.current = userId;
          return; // すでに処理済み
        }
        
        if (await ongoingRequests[userId]) {
          lastSessionIdRef.current = userId;
          return; // 処理中
        }
        
        if (!isInitializedRef.current || lastSessionIdRef.current !== userId) {
          isInitializedRef.current = true;
          lastSessionIdRef.current = userId;
          checkUserExists();
        }
      } else if (status === 'unauthenticated') {
        isInitializedRef.current = false;
        lastSessionIdRef.current = undefined;
        setCurrentUser(null);
        setUserExists(false);
      }
    };
    run();
  }, [session?.user?.id, status, checkUserExists]);

  return {
    currentUser,
    session: session as ExtendedSession | null,
    userExists,
    isLoading,
    isAuthenticated,
    createUserAndRefresh,
  };
};