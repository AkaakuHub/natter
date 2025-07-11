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
  // 注意: より具体的なパターンを先に配置して、曖昧なマッチングを避ける
  const componentMap = useMemo(
    () => [
      { pattern: "/", component: HomeView },
      { pattern: "/search", component: SearchView },
      { pattern: "/login", component: LoginView },
      { pattern: "/notification", component: NotificationView },
      { pattern: "/set-list", component: SetListView },
      { pattern: "/profile/following", component: FollowingView },
      { pattern: "/profile/followers", component: FollowersView },
      { pattern: "/profile/:id/following", component: FollowingView },
      { pattern: "/profile/:id/followers", component: FollowersView },
      { pattern: "/profile/:id", component: ProfileView },
      { pattern: "/profile", component: ProfileView },
      { pattern: "/post/:id", component: PostView },
    ],
    [],
  );

  // パスベースでコンポーネントを解決
  const resolveComponentByPath = useCallback(
    async (pathname: string): Promise<React.ComponentType> => {
      console.log(
        `🔍 [VIEW RENDERER] Resolving component by path: ${pathname}`,
      );

      // 動的パラメータをパターンに変換
      const patterns = componentMap.map((item) => item.pattern);
      console.log(`🔍 [VIEW RENDERER] Available patterns:`, patterns);

      for (const item of componentMap) {
        console.log(
          `🔍 [VIEW RENDERER] Checking pattern: ${item.pattern} vs ${pathname}`,
        );
        if (matchPattern(item.pattern, pathname)) {
          console.log(`🔍 [VIEW RENDERER] Pattern matched: ${item.pattern}`);
          const ComponentLoader = item.component;
          console.log(
            `🔍 [VIEW RENDERER] Component loader:`,
            ComponentLoader.name,
          );
          return ComponentLoader;
        }
      }

      // 404の場合
      console.log(
        `🔍 [VIEW RENDERER] No pattern matched, returning NotFoundView`,
      );
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

        console.log(
          `🔍 [VIEW RENDERER] Resolving component for path: ${pathname}`,
        );

        // ルート定義を取得
        const routeDef = routeEngine.getRouteDefinition(pathname);
        console.log(`🔍 [VIEW RENDERER] Route definition:`, routeDef);

        if (routeDef?.component) {
          // ルート定義からコンポーネントを動的ロード
          console.log(`🔍 [VIEW RENDERER] Using route definition component`);
          const { default: Component } = await routeDef.component();
          console.log(`🔍 [VIEW RENDERER] Loaded component:`, Component.name);
          setViewComponent(() => Component);
        } else {
          // フォールバック: パスベースでコンポーネントを解決
          console.log(
            `🔍 [VIEW RENDERER] Using fallback path-based resolution`,
          );
          const Component = await resolveComponentByPath(pathname);
          console.log(`🔍 [VIEW RENDERER] Resolved component:`, Component.name);
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
    console.log(`🔍 [PATTERN MATCH] Checking: ${pattern} vs ${pathname}`);

    if (pattern === pathname) {
      console.log(`🔍 [PATTERN MATCH] Exact match: ${pattern}`);
      return true;
    }

    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = pathname.split("/").filter(Boolean);

    console.log(
      `🔍 [PATTERN MATCH] Pattern parts: [${patternParts.join(", ")}]`,
    );
    console.log(`🔍 [PATTERN MATCH] Path parts: [${pathParts.join(", ")}]`);

    if (patternParts.length !== pathParts.length) {
      console.log(
        `🔍 [PATTERN MATCH] Length mismatch: ${patternParts.length} vs ${pathParts.length}`,
      );
      return false;
    }

    const match = patternParts.every((part, index) => {
      const isParamMatch = part.startsWith(":");
      const isExactMatch = part === pathParts[index];
      console.log(
        `🔍 [PATTERN MATCH] Part ${index}: "${part}" vs "${pathParts[index]}" - param:${isParamMatch}, exact:${isExactMatch}`,
      );
      return isParamMatch || isExactMatch;
    });

    console.log(`🔍 [PATTERN MATCH] Final result: ${match}`);
    return match;
  };

  // ルート変更時にコンポーネントを解決
  useEffect(() => {
    if (currentRoute?.path) {
      console.log(`🚨 [VIEW RENDERER] Route changed to: ${currentRoute.path}`);
      console.log(`🚨 [VIEW RENDERER] Route params:`, currentRoute.params);
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
