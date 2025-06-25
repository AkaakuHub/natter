import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UsersApi } from '@/api/users';
import { User } from '@/api';
import { ExtendedSession } from '@/types';

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

  const isLoading = status === 'loading' || userExists === null;
  const isAuthenticated = status === 'authenticated' && !!session;

  // ユーザーの存在をチェック
  const checkUserExists = async () => {
    if (session?.user?.id) {
      try {
        console.log('Checking user with Twitter ID:', session.user.id);
        const user = await UsersApi.getUserByTwitterId(session.user.id);
        console.log('Found user:', user);
        setCurrentUser(user);
        setUserExists(!!user);
      } catch (error) {
        console.error('Error checking user:', error);
        setCurrentUser(null);
        setUserExists(false);
      }
    } else {
      setCurrentUser(null);
      setUserExists(false);
    }
  };

  // ユーザー作成後にリフレッシュ
  const createUserAndRefresh = async () => {
    if (!session?.user?.id) {
      throw new Error('Session not available');
    }

    const userData = {
      twitterId: session.user.id,
      name: session.user.name || "Unknown User",
      email: session.user.email || undefined,
      image: session.user.image || undefined,
    };

    console.log('Creating user with data:', userData);
    const createdUser = await UsersApi.createUser(userData);
    console.log('Created user:', createdUser);

    // ユーザー作成後、再度チェック
    await checkUserExists();
  };

  useEffect(() => {
    if (status === 'authenticated' && session) {
      checkUserExists();
    } else if (status === 'unauthenticated') {
      setCurrentUser(null);
      setUserExists(false);
    }
  }, [session, status]);

  return {
    currentUser,
    session: session as ExtendedSession | null,
    userExists,
    isLoading,
    isAuthenticated,
    createUserAndRefresh,
  };
};