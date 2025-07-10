"use client";

import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useTrueSPARouter } from "./TrueSPARouter";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// 動的インポートによるコード分割
const HomeView = lazy(() => import("@/components/views/HomeView"));
const SearchView = lazy(() => import("@/components/views/SearchView"));
const LoginView = lazy(() => import("@/components/views/LoginView"));
const NotificationView = lazy(
  () => import("@/components/views/NotificationView"),
);
const PostView = lazy(() => import("@/components/views/PostView"));
const ProfileView = lazy(() => import("@/components/views/ProfileView"));
const FollowersView = lazy(() => import("@/components/views/FollowersView"));
const FollowingView = lazy(() => import("@/components/views/FollowingView"));
const SetListView = lazy(() => import("@/components/views/SetListView"));

// 404ページ
const NotFoundView = lazy(() => import("@/components/views/NotFoundView"));

interface ViewRendererProps {
  fallback?: React.ComponentType;
}

export const ViewRenderer: React.FC<ViewRendererProps> = ({
  fallback: Fallback = LoadingSpinner,
}) => {
  const { currentRoute, routeEngine } = useTrueSPARouter();
  const [ViewComponent, setViewComponent] =
    useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // プリロード用のコンポーネントマップ
  const componentMap = useMemo(
    () => ({
      "/": HomeView,
      "/search": SearchView,
      "/login": LoginView,
      "/notification": NotificationView,
      "/post/:id": PostView,
      "/profile": ProfileView,
      "/profile/:id": ProfileView,
      "/profile/following": FollowingView,
      "/profile/followers": FollowersView,
      "/profile/:id/following": FollowingView,
      "/profile/:id/followers": FollowersView,
      "/set-list": SetListView,
    }),
    [],
  );

  // パスベースでコンポーネントを解決
  const resolveComponentByPath = useCallback(
    async (pathname: string): Promise<React.ComponentType> => {
      // 動的パラメータをパターンに変換
      const patterns = Object.keys(componentMap);

      for (const pattern of patterns) {
        if (matchPattern(pattern, pathname)) {
          const ComponentLoader =
            componentMap[pattern as keyof typeof componentMap];
          return ComponentLoader;
        }
      }

      // 404の場合
      return NotFoundView;
    },
    [componentMap],
  );

  // ビューコンポーネントを解決
  const resolveViewComponent = useCallback(
    async (pathname: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // ルート定義を取得
        const routeDef = routeEngine.getRouteDefinition(pathname);

        if (routeDef?.component) {
          // ルート定義からコンポーネントを動的ロード
          const { default: Component } = await routeDef.component();
          setViewComponent(() => Component);
        } else {
          // フォールバック: パスベースでコンポーネントを解決
          const Component = await resolveComponentByPath(pathname);
          setViewComponent(() => Component);
        }
      } catch (err) {
        console.error("Failed to load view component:", err);
        setError(err as Error);
        setViewComponent(() => NotFoundView);
      } finally {
        setIsLoading(false);
      }
    },
    [routeEngine, resolveComponentByPath],
  );

  // パターンマッチング
  const matchPattern = (pattern: string, pathname: string): boolean => {
    if (pattern === pathname) return true;

    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = pathname.split("/").filter(Boolean);

    if (patternParts.length !== pathParts.length) return false;

    return patternParts.every((part, index) => {
      return part.startsWith(":") || part === pathParts[index];
    });
  };

  // ルート変更時にコンポーネントを解決
  useEffect(() => {
    if (currentRoute?.path) {
      resolveViewComponent(currentRoute.path);
    }
  }, [currentRoute?.path, resolveViewComponent]);

  // プリロード機能
  const preloadView = useCallback(
    async (pathname: string) => {
      try {
        const routeDef = routeEngine.getRouteDefinition(pathname);
        if (routeDef?.component) {
          await routeDef.component();
        } else {
          await resolveComponentByPath(pathname);
        }
      } catch (err) {
        console.warn("Failed to preload view:", pathname, err);
      }
    },
    [routeEngine, resolveComponentByPath],
  );

  // 主要ページのプリロード
  useEffect(() => {
    const commonPaths = ["/search", "/notification", "/profile"];
    commonPaths.forEach((path) => {
      setTimeout(() => preloadView(path), 1000);
    });
  }, [preloadView]);

  // ローディング状態
  if (isLoading) {
    return (
      <Suspense fallback={<Fallback />}>
        <Fallback />
      </Suspense>
    );
  }

  // エラー状態
  if (error || !ViewComponent) {
    return (
      <Suspense fallback={<Fallback />}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-bold text-error mb-2">
              Error Loading Page
            </h2>
            <p className="text-text-secondary">
              {error?.message || "Unknown error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-interactive text-text-inverse rounded hover:bg-interactive-hover"
            >
              Reload Page
            </button>
          </div>
        </div>
      </Suspense>
    );
  }

  // 正常なビューレンダリング
  return (
    <Suspense fallback={<Fallback />}>
      <ViewComponent />
    </Suspense>
  );
};
