"use client";

import {
  IconHome,
  IconVinyl,
  IconBell,
  IconSearch,
  IconClock,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";
import { useHybridSPAAuth } from "@/core/auth/HybridSPAAuth";

const items = [
  { label: "ホーム", icon: IconHome, href: "/" },
  { label: "検索", icon: IconSearch, href: "/search" },
  { label: "通知", icon: IconBell, href: "/notification" },
  { label: "タイマー", icon: IconClock, href: "/timer" },
  { label: "セトリ", icon: IconVinyl, href: "/set-list" },
];

function availableColor(pathname: string, href: string) {
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
}

interface HybridFooterMenuProps {
  path: string;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function HybridFooterMenu({
  path,
  scrollContainerRef,
}: HybridFooterMenuProps) {
  const { navigate } = useTrueSPARouter();
  const { isHydrated, isInitialLoad } = useHybridSPAAuth();

  const handleNavigation = (href: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    // 現在のタブと同じページにいる場合はスムーズスクロール
    let isCurrentPage = false;

    if (href === "/") {
      // ホーム（タイムライン）の場合：ルートパスのみ
      isCurrentPage = normalizedPath === "/";
    } else {
      // その他のページ：パスがhrefで始まる場合
      isCurrentPage = normalizedPath.startsWith(href);
    }

    if (isCurrentPage) {
      // 現在のページなので、トップにスクロール
      scrollContainerRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // 別のページに移動
      // ハイブリッドモード：初回ロードやhydration前は通常のナビゲーション
      if (isInitialLoad || !isHydrated) {
        window.location.href = href;
      } else {
        // SPA モードでのナビゲーション（既存機能保護）
        navigate(href);
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border h-[60px] backdrop-blur-sm">
      <div className="flex justify-around items-center h-full px-4">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavigation(item.href)}
            className={clsx(
              "flex flex-col items-center justify-center p-2 transition-colors duration-200 h-full",
              availableColor(path, item.href),
            )}
          >
            <item.icon size={20} className="mb-1" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
