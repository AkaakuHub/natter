import { useRouter, usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';

export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  const navigateToTimeline = useCallback(() => {
    router.push('/');
    setNavigationHistory(prev => [...prev, '/']);
  }, [router]);

  const navigateToProfile = useCallback((userId?: string) => {
    const profilePath = userId ? `/profile?userId=${userId}` : '/profile';
    router.push(profilePath);
    setNavigationHistory(prev => [...prev, profilePath]);
  }, [router]);

  const navigateToPost = useCallback((postId: number) => {
    const postPath = `/post/${postId}`;
    router.push(postPath);
    setNavigationHistory(prev => [...prev, postPath]);
  }, [router]);

  const goBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      router.push(previousPage);
    } else {
      router.back(); // Use Next.js built-in back navigation
    }
  }, [router, navigationHistory]);

  const getCurrentPath = useCallback(() => {
    return pathname.slice(1) || '';
  }, [pathname]);

  return {
    navigateToTimeline,
    navigateToProfile,
    navigateToPost,
    goBack,
    getCurrentPath,
    currentPath: pathname,
  };
};