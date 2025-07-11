"use client";

import React, { useMemo, useEffect, useState } from "react";
import { TrueSPARouterProvider } from "./router/TrueSPARouter";
import { HybridSPAAuthProvider } from "./auth/HybridSPAAuth";
import { ViewRenderer } from "./router/ViewRenderer";
import { RouteDefinition } from "./router/RouteEngine";
import { useSearchParams } from "next/navigation";

// 既存のBaseLayoutを保護・活用
import BaseLayout from "@/components/layout/BaseLayout";
import HybridBaseLayout from "@/components/layout/HybridBaseLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// ルート定義（既存機能完全保護）
const routes: RouteDefinition[] = [
  {
    pattern: "/",
    component: () => import("@/components/views/HomeView"),
    title: "Natter - Home",
    meta: {
      description: "Natter social media timeline",
    },
    authRequired: true,
  },
  {
    pattern: "/search",
    component: () => import("@/components/views/SearchView"),
    title: "Natter - Search",
    meta: {
      description: "Search posts and users on Natter",
    },
    authRequired: true,
  },
  {
    pattern: "/login",
    component: () => import("@/components/views/LoginView"),
    title: "Natter - Login",
    meta: {
      description: "Login to Natter",
    },
    authRequired: false,
  },
  {
    pattern: "/notification",
    component: () => import("@/components/views/NotificationView"),
    title: "Natter - Notifications",
    meta: {
      description: "Your notifications on Natter",
    },
    authRequired: true,
  },
  {
    pattern: "/post/:id",
    component: () => import("@/components/views/PostView"),
    title: "Natter - Post",
    meta: {
      description: "View post on Natter",
    },
    authRequired: false, // MAXDEPTHGODULTRADEEPTHINK: OGPとログインなしアクセスのため
  },
  {
    pattern: "/profile",
    component: () => import("@/components/views/ProfileView"),
    title: "Natter - My Profile",
    meta: {
      description: "Your profile on Natter",
    },
    authRequired: false, // MAXDEPTHGODULTRADEEPTHINK: OGPとログインなしアクセスのため
  },
  // 🔥 静的ルートを動的ルートより先に配置！
  {
    pattern: "/profile/following",
    component: () => import("@/components/views/FollowingView"),
    title: "Natter - Following",
    meta: {
      description: "People you follow on Natter",
    },
    authRequired: false, // MAXDEPTHGODULTRADEEPTHINK: OGPとログインなしアクセスのため
  },
  {
    pattern: "/profile/followers",
    component: () => import("@/components/views/FollowersView"),
    title: "Natter - Followers",
    meta: {
      description: "Your followers on Natter",
    },
    authRequired: false, // MAXDEPTHGODULTRADEEPTHINK: OGPとログインなしアクセスのため
  },
  // 🔥 動的ルートは静的ルートの後に配置
  {
    pattern: "/profile/:id",
    component: () => import("@/components/views/ProfileView"),
    title: "Natter - Profile",
    meta: {
      description: "User profile on Natter",
    },
    authRequired: false, // MAXDEPTHGODULTRADEEPTHINK: OGPとログインなしアクセスのため
  },
  {
    pattern: "/profile/:id/following",
    component: () => import("@/components/views/FollowingView"),
    title: "Natter - Following",
    meta: {
      description: "People this user follows on Natter",
    },
    authRequired: true,
  },
  {
    pattern: "/profile/:id/followers",
    component: () => import("@/components/views/FollowersView"),
    title: "Natter - Followers",
    meta: {
      description: "This user&apos;s followers on Natter",
    },
    authRequired: true,
  },
  {
    pattern: "/set-list",
    component: () => import("@/components/views/SetListView"),
    title: "Natter - Characters",
    meta: {
      description: "Your characters on Natter",
    },
    authRequired: true,
  },
];

interface HybridSPAProps {
  children?: React.ReactNode;
  initialPath?: string;
  ssrMode?: boolean;
}

export const HybridSPA: React.FC<HybridSPAProps> = ({
  children,
  initialPath,
  ssrMode = false,
}) => {
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentPath, setCurrentPath] = useState(initialPath || "/");

  // URL パラメータから初期パスを取得
  useEffect(() => {
    const spaPath = searchParams.get("spa-path");
    const ssrPath = searchParams.get("ssr-path");

    if (spaPath) {
      setCurrentPath(spaPath);
    } else if (ssrPath) {
      setCurrentPath(ssrPath);
    }

    setIsHydrated(true);
  }, [searchParams]);

  // ルート定義をメモ化して再レンダリングを防ぐ
  const memoizedRoutes = useMemo(() => routes, []);

  // SSRモードの場合は既存のレイアウトをそのまま返す
  if (ssrMode && !isHydrated) {
    return <BaseLayout>{children}</BaseLayout>;
  }

  return (
    <TrueSPARouterProvider routes={memoizedRoutes} initialPath={currentPath}>
      <HybridSPAAuthProvider>
        <HybridSPAApplication>{children}</HybridSPAApplication>
      </HybridSPAAuthProvider>
    </TrueSPARouterProvider>
  );
};

// 内部のSPAアプリケーションコンポーネント（ハイブリッドレイアウト使用）
const HybridSPAApplication: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <HybridBaseLayout>
      {children || <ViewRenderer fallback={LoadingSpinner} />}
    </HybridBaseLayout>
  );
};
