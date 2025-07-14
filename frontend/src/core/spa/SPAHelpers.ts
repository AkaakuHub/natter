// SPA Helper Functions - 一元管理
import { MAIN_NAVIGATION_ROUTES, ALL_ROUTES } from "./SPARoutes";
import {
  IconHome,
  IconVinyl,
  IconBell,
  IconSearch,
  IconClock,
  IconLogin,
  IconFileText,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

// アイコンマッピング - アイコンを一元管理
export const ICON_MAP = {
  IconHome,
  IconSearch,
  IconBell,
  IconClock,
  IconVinyl,
  IconLogin,
  IconFileText,
  IconUser,
  IconUsers,
} as const;

export const getIconComponent = (iconName: string) => {
  return ICON_MAP[iconName as keyof typeof ICON_MAP] || ICON_MAP.IconHome;
};

// パスの色を取得（フッターメニューなどで使用）
export const getPathColor = (pathname: string, href: string): string => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  let isAvailable = false;

  if (href === "/") {
    // ホーム（タイムライン）の場合：ルートパスのみアクティブ
    isAvailable = normalizedPath === "/";
  } else {
    // その他のページ：パスがhrefで始まる場合
    isAvailable = normalizedPath.startsWith(href);
  }

  return isAvailable ? "text-interactive" : "text-text-muted";
};

// 現在のページかどうかを判定
export const isCurrentPage = (pathname: string, href: string): boolean => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (href === "/") {
    // ホーム（タイムライン）の場合：ルートパスのみ
    return normalizedPath === "/";
  } else {
    // その他のページ：パスがhrefで始まる場合
    return normalizedPath.startsWith(href);
  }
};

// スクロールのトップ移動処理
export const scrollToTop = (
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
) => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } else {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};

// フッターメニューのアイテムを取得
export const getFooterMenuItems = () => {
  return MAIN_NAVIGATION_ROUTES.map((route) => ({
    label: route.label,
    icon: route.icon,
    href: route.path,
  }));
};

// ViewRendererのコンポーネントマップを生成
export const generateViewRendererComponentMap = () => {
  return ALL_ROUTES.map((route) => ({
    pattern: route.path,
    component: route.component,
  }));
};

// パターンマッチング（ViewRendererで使用）
export const matchPattern = (pattern: string, pathname: string): boolean => {
  if (pattern === pathname) {
    return true;
  }

  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    const isParamMatch = part.startsWith(":");
    const isExactMatch = part === pathParts[index];
    return isParamMatch || isExactMatch;
  });
};
