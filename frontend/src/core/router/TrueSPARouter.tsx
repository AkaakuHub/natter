"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { RouteEngine, RouteDefinition, ParsedRoute } from "./RouteEngine";

interface TrueSPARouterContextType {
  currentRoute: ParsedRoute | null;
  navigate: (
    to: string,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
  back: () => void;
  forward: () => void;
  isLoading: boolean;
  routeEngine: RouteEngine;
}

const TrueSPARouterContext = createContext<TrueSPARouterContextType | null>(
  null,
);

export const useTrueSPARouter = () => {
  const context = useContext(TrueSPARouterContext);
  if (!context) {
    throw new Error(
      "useTrueSPARouter must be used within TrueSPARouterProvider",
    );
  }
  return context;
};

interface TrueSPARouterProviderProps {
  children: React.ReactNode;
  routes: RouteDefinition[];
  initialPath?: string;
}

export const TrueSPARouterProvider: React.FC<TrueSPARouterProviderProps> = ({
  children,
  routes,
  initialPath,
}) => {
  const [currentRoute, setCurrentRoute] = useState<ParsedRoute | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // RouteEngineをメモ化
  const routeEngine = useMemo(() => {
    const engine = new RouteEngine();
    engine.addRoutes(routes);
    return engine;
  }, [routes]);

  // ルート変更ハンドラ
  const handleRouteChange = useCallback(
    (event: { from: ParsedRoute | null; to: ParsedRoute }) => {
      setIsLoading(false);
      setCurrentRoute(event.to);
    },
    [],
  );

  // 初期化
  useEffect(() => {
    routeEngine.initialize();

    // 初期パスが指定されている場合は使用
    if (initialPath && initialPath !== window.location.pathname) {
      // URLを実際に変更
      window.history.replaceState(null, "", initialPath);
      routeEngine.navigate(initialPath, { replace: true });
    }

    setCurrentRoute(routeEngine.getCurrentRoute());

    routeEngine.on("routeChange", handleRouteChange);

    return () => {
      routeEngine.off("routeChange", handleRouteChange);
      routeEngine.destroy();
    };
  }, [routeEngine, handleRouteChange, initialPath]);

  // ナビゲーション関数
  const navigate = useCallback(
    (to: string, options?: { replace?: boolean; state?: unknown }) => {
      console.log(`🔥 [SPA Navigate] Navigating to: ${to}`);

      // 純粋なSPAナビゲーション（リロードなし）
      setIsLoading(true);
      routeEngine.navigate(to, options);
    },
    [routeEngine],
  );

  const back = useCallback(() => {
    setIsLoading(true);
    routeEngine.back();
  }, [routeEngine]);

  const forward = useCallback(() => {
    setIsLoading(true);
    routeEngine.forward();
  }, [routeEngine]);

  const contextValue = useMemo(
    () => ({
      currentRoute,
      navigate,
      back,
      forward,
      isLoading,
      routeEngine,
    }),
    [currentRoute, navigate, back, forward, isLoading, routeEngine],
  );

  return (
    <TrueSPARouterContext.Provider value={contextValue}>
      {children}
    </TrueSPARouterContext.Provider>
  );
};
