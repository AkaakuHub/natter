import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";
import { MAIN_NAVIGATION_ROUTES } from "./SPARoutes";

// SPA Navigation Hook - 一元管理
export const useSPANavigation = () => {
  const nextRouter = useRouter();
  const pathname = usePathname();
  const spaRouter = useTrueSPARouter();

  // 汎用ナビゲーション関数
  const navigateToPath = useCallback(
    (path: string) => {
      if (spaRouter?.navigate) {
        spaRouter.navigate(path);
      } else {
        nextRouter.push(path);
      }
    },
    [nextRouter, spaRouter],
  );

  // 戻る・進む
  const goBack = useCallback(() => {
    if (spaRouter?.back) {
      spaRouter.back();
    } else {
      nextRouter.back();
    }
  }, [nextRouter, spaRouter]);

  const goForward = useCallback(() => {
    if (spaRouter?.forward) {
      spaRouter.forward();
    } else {
      // Next.jsには forward がないので、履歴を使用
      window.history.forward();
    }
  }, [spaRouter]);

  // 各ルートへの個別ナビゲーション関数を動的生成
  const navigationFunctions = MAIN_NAVIGATION_ROUTES.reduce(
    (acc, route) => {
      const functionName = `navigateTo${route.label.replace(/[^\w]/g, "")}`;
      acc[functionName] = () => navigateToPath(route.path);
      return acc;
    },
    {} as Record<string, () => void>,
  );

  // 追加の特殊ナビゲーション関数
  const navigateToProfile = useCallback(
    (userId?: string) => {
      const profilePath = userId ? `/profile/${userId}` : "/profile";
      navigateToPath(profilePath);
    },
    [navigateToPath],
  );

  const navigateToPost = useCallback(
    (postId: number | string) => {
      const postPath = `/post/${postId}`;
      navigateToPath(postPath);
    },
    [navigateToPath],
  );

  const navigateToFollowing = useCallback(
    (userId: string) => {
      const path = `/profile/${userId}/following`;
      navigateToPath(path);
    },
    [navigateToPath],
  );

  const navigateToFollowers = useCallback(
    (userId: string) => {
      const path = `/profile/${userId}/followers`;
      navigateToPath(path);
    },
    [navigateToPath],
  );

  return {
    // 汎用関数
    navigateToPath,
    goBack,
    goForward,

    // 動的生成された関数
    ...navigationFunctions,

    // 特殊な関数
    navigateToProfile,
    navigateToPost,
    navigateToFollowing,
    navigateToFollowers,

    // 後方互換性のための明示的な関数
    navigateToTimeline: () => navigateToPath("/"),
    navigateToSearch: () => navigateToPath("/search"),
    navigateToNotification: () => navigateToPath("/notification"),
    navigateToTimer: () => navigateToPath("/timer"),
    navigateToSetList: () => navigateToPath("/set-list"),
    navigateToLogin: () => navigateToPath("/login"),

    // 状態情報
    canGoBack: true,
    isAtRoot: pathname === "/",
    currentPath: pathname,
    getCurrentPath: useCallback(() => {
      return pathname.slice(1) || "";
    }, [pathname]),
  };
};
