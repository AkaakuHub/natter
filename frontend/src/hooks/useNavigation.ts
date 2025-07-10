import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";

export const useNavigation = () => {
  const nextRouter = useRouter();
  const pathname = usePathname();

  // SPA Router を常に呼び出し（React Hook Rules準拠）
  const spaRouter = useTrueSPARouter();

  const navigateToTimeline = useCallback(() => {
    if (spaRouter?.navigate) {
      console.log("🔥 [SPA Navigation] Going to timeline");
      spaRouter.navigate("/");
    } else {
      nextRouter.push("/");
    }
  }, [nextRouter, spaRouter]);

  const navigateToProfile = useCallback(
    (userId?: string) => {
      const profilePath = userId ? `/profile/${userId}` : "/profile";
      if (spaRouter?.navigate) {
        console.log(`🔥 [SPA Navigation] Going to profile: ${profilePath}`);
        spaRouter.navigate(profilePath);
      } else {
        nextRouter.push(profilePath);
      }
    },
    [nextRouter, spaRouter],
  );

  const navigateToPost = useCallback(
    (postId: number) => {
      const postPath = `/post/${postId}`;
      if (spaRouter?.navigate) {
        console.log(`🔥 [SPA Navigation] Going to post: ${postPath}`);
        spaRouter.navigate(postPath);
      } else {
        nextRouter.push(postPath);
      }
    },
    [nextRouter, spaRouter],
  );

  const goBack = useCallback(() => {
    if (spaRouter?.back) {
      spaRouter.back();
    } else {
      nextRouter.back();
    }
  }, [nextRouter, spaRouter]);

  const navigateToFollowing = useCallback(
    (userId?: string) => {
      const path = userId
        ? `/profile/${userId}/following`
        : "/profile/following";
      if (spaRouter?.navigate) {
        console.log(`🔥 [SPA Navigation] Going to following: ${path}`);
        spaRouter.navigate(path);
      } else {
        nextRouter.push(path);
      }
    },
    [nextRouter, spaRouter],
  );

  const navigateToFollowers = useCallback(
    (userId?: string) => {
      const path = userId
        ? `/profile/${userId}/followers`
        : "/profile/followers";
      if (spaRouter?.navigate) {
        console.log(`🔥 [SPA Navigation] Going to followers: ${path}`);
        spaRouter.navigate(path);
      } else {
        nextRouter.push(path);
      }
    },
    [nextRouter, spaRouter],
  );

  const navigateToNotification = useCallback(() => {
    if (spaRouter?.navigate) {
      console.log("🔥 [SPA Navigation] Going to notification");
      spaRouter.navigate("/notification");
    } else {
      nextRouter.push("/notification");
    }
  }, [nextRouter, spaRouter]);

  const navigateToSearch = useCallback(() => {
    if (spaRouter?.navigate) {
      console.log("🔥 [SPA Navigation] Going to search");
      spaRouter.navigate("/search");
    } else {
      nextRouter.push("/search");
    }
  }, [nextRouter, spaRouter]);

  const getCurrentPath = useCallback(() => {
    return pathname.slice(1) || "";
  }, [pathname]);

  return {
    navigateToTimeline,
    navigateToProfile,
    navigateToPost,
    navigateToFollowing,
    navigateToFollowers,
    navigateToNotification,
    navigateToSearch,
    goBack,
    getCurrentPath,
    currentPath: pathname,
    canGoBack: true, // ブラウザの戻るボタンが使える
    isAtRoot: pathname === "/",
  };
};
