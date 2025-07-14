"use client";

import React, { useMemo, useEffect, useState } from "react";
import { TrueSPARouterProvider } from "./router/TrueSPARouter";
import { HybridSPAAuthProvider } from "./auth/HybridSPAAuth";
import { ViewRenderer } from "./router/ViewRenderer";
import { RouteDefinition } from "./router/RouteEngine";
import { useSearchParams } from "next/navigation";
import { ALL_ROUTES } from "./spa/SPARoutes";

// 既存のBaseLayoutを保護・活用
import BaseLayout from "@/components/layout/BaseLayout";
import HybridBaseLayout from "@/components/layout/HybridBaseLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// ルート定義を一元管理されたデータから生成
const routes: RouteDefinition[] = ALL_ROUTES.map((route) => ({
  pattern: route.path,
  component: route.component,
  title: route.title,
  meta: {
    description: route.description,
  },
  authRequired: route.authRequired ?? false,
}));

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
