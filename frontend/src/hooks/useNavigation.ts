import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useNavigationStackContext } from '@/components/providers/NavigationStackProvider';

// useNavigationフックをNavigationStackに対応
export const useNavigation = () => {
  const navigationStack = useNavigationStackContext();
  const router = useRouter();
  const pathname = usePathname();

  // フォールバック用のコールバック（常に定義する）
  const fallbackNavigateToTimeline = useCallback(() => {
    router.push('/');
  }, [router]);

  const fallbackNavigateToProfile = useCallback((userId?: string) => {
    const profilePath = userId ? `/profile?userId=${userId}` : '/profile';
    router.push(profilePath);
  }, [router]);

  const fallbackNavigateToPost = useCallback((postId: number) => {
    const postPath = `/post/${postId}`;
    router.push(postPath);
  }, [router]);

  const fallbackGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const fallbackGetCurrentPath = useCallback(() => {
    return pathname.slice(1) || '';
  }, [pathname]);

  // NavigationStackContextが利用可能な場合はそれを使用
  if (navigationStack) {
    return {
      navigateToTimeline: navigationStack.navigateToTimeline,
      navigateToProfile: navigationStack.navigateToProfile,
      navigateToPost: navigationStack.navigateToPost,
      goBack: navigationStack.popPage,
      getCurrentPath: () => navigationStack.currentPage?.component.toLowerCase() || '',
      currentPath: navigationStack.currentPage?.path || pathname,
      canGoBack: navigationStack.canGoBack,
      isAtRoot: navigationStack.isAtRoot,
      stack: navigationStack.stack,
    };
  }

  // フォールバック: 従来のrouter-basedナビゲーション
  return {
    navigateToTimeline: fallbackNavigateToTimeline,
    navigateToProfile: fallbackNavigateToProfile,
    navigateToPost: fallbackNavigateToPost,
    goBack: fallbackGoBack,
    getCurrentPath: fallbackGetCurrentPath,
    currentPath: pathname,
    canGoBack: false, // フォールバックでは不明
    isAtRoot: pathname === '/',
    stack: null,
  };
};