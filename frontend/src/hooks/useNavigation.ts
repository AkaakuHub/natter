import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToTimeline = useCallback(() => {
    router.push("/");
  }, [router]);

  const navigateToProfile = useCallback(
    (userId?: string) => {
      const profilePath = userId ? `/profile/${userId}` : "/profile";
      router.push(profilePath);
    },
    [router],
  );

  const navigateToPost = useCallback(
    (postId: number) => {
      const postPath = `/post/${postId}`;
      router.push(postPath);
    },
    [router],
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const getCurrentPath = useCallback(() => {
    return pathname.slice(1) || "";
  }, [pathname]);

  return {
    navigateToTimeline,
    navigateToProfile,
    navigateToPost,
    goBack,
    getCurrentPath,
    currentPath: pathname,
    canGoBack: true, // ブラウザの戻るボタンが使える
    isAtRoot: pathname === "/",
  };
};
