import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface NavigationPage {
  id: string;
  path: string;
  component: string;
  props?: unknown;
  title?: string;
}

export interface NavigationStackState {
  pages: NavigationPage[];
  currentIndex: number;
  sidebarVisible: boolean;
  canSwipeToSidebar: boolean;
}

export const useNavigationStack = () => {
  const router = useRouter();
  const [stack, setStack] = useState<NavigationStackState>({
    pages: [{ id: 'timeline', path: '/', component: 'TimeLine', title: 'ホーム' }],
    currentIndex: 0,
    sidebarVisible: false,
    canSwipeToSidebar: true,
  });

  const stackRef = useRef(stack);
  stackRef.current = stack;

  const pushPage = useCallback((page: NavigationPage) => {
    setStack(prev => {
      const newPages = [...prev.pages, page];
      return {
        ...prev,
        pages: newPages,
        currentIndex: newPages.length - 1,
        sidebarVisible: false,
        canSwipeToSidebar: false, // スタックがある時はサイドバーへのスワイプを無効
      };
    });
    router.push(page.path);
  }, [router]);

  const popPage = useCallback(() => {
    setStack(prev => {
      if (prev.pages.length <= 1) return prev;
      
      const newPages = prev.pages.slice(0, -1);
      const newIndex = newPages.length - 1;
      const targetPage = newPages[newIndex];
      
      const newState = {
        ...prev,
        pages: newPages,
        currentIndex: newIndex,
        sidebarVisible: false,
        canSwipeToSidebar: newPages.length === 1, // 最後のページに戻った時だけサイドバースワイプを有効
      };
      
      router.push(targetPage.path);
      return newState;
    });
  }, [router]);

  const goToPage = useCallback((index: number) => {
    if (index < 0 || index >= stack.pages.length) return;
    
    setStack(prev => {
      const targetPage = prev.pages[index];
      router.push(targetPage.path);
      
      return {
        ...prev,
        currentIndex: index,
        sidebarVisible: false,
        canSwipeToSidebar: index === 0,
      };
    });
  }, [router, stack.pages.length]);

  const showSidebar = useCallback(() => {
    if (!stack.canSwipeToSidebar) return;
    
    setStack(prev => ({
      ...prev,
      sidebarVisible: true,
    }));
  }, [stack.canSwipeToSidebar]);

  const hideSidebar = useCallback(() => {
    setStack(prev => ({
      ...prev,
      sidebarVisible: false,
    }));
  }, []);

  const navigateToTimeline = useCallback(() => {
    if (stack.pages.length === 1 && stack.pages[0].component === 'TimeLine') {
      return; // 既にタイムライン
    }

    setStack({
      pages: [{ id: 'timeline', path: '/', component: 'TimeLine', title: 'ホーム' }],
      currentIndex: 0,
      sidebarVisible: false,
      canSwipeToSidebar: true,
    });
    router.push('/');
  }, [router, stack.pages]);

  const navigateToProfile = useCallback((userId?: string) => {
    // userIdが指定されていない場合は、直接自分のIDページに遷移するのではなく
    // スタック内では 'me' として管理し、実際のルーティングは[id]ページで処理
    const profilePath = userId ? `/profile/${userId}` : '/profile';
    const profilePage: NavigationPage = {
      id: `profile-${userId || 'me'}`,
      path: profilePath,
      component: 'Profile',
      props: { userId },
      title: 'プロフィール',
    };
    pushPage(profilePage);
  }, [pushPage]);

  const navigateToPost = useCallback((postId: number) => {
    const postPage: NavigationPage = {
      id: `post-${postId}`,
      path: `/post/${postId}`,
      component: 'DetailedPost',
      props: { postId },
      title: 'ポスト',
    };
    pushPage(postPage);
  }, [pushPage]);

  const canGoBack = stack.pages.length > 1;
  const currentPage = stack.pages[stack.currentIndex];
  const isAtRoot = stack.currentIndex === 0;

  return {
    stack,
    currentPage,
    canGoBack,
    isAtRoot,
    pushPage,
    popPage,
    goToPage,
    showSidebar,
    hideSidebar,
    navigateToTimeline,
    navigateToProfile,
    navigateToPost,
  };
};