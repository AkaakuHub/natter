"use client";

import clsx from "clsx";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";
import { useHybridSPAAuth } from "@/core/auth/HybridSPAAuth";
import {
  getFooterMenuItems,
  getPathColor,
  isCurrentPage,
  scrollToTop,
  getIconComponent,
} from "@/core/spa";

const items = getFooterMenuItems();

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
    // 現在のタブと同じページにいる場合はスムーズスクロール
    if (isCurrentPage(path, href)) {
      scrollToTop(scrollContainerRef);
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
      <div className="flex items-center h-full">
        {items.map((item) => {
          const IconComponent = getIconComponent(item.icon);
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.href)}
              className={clsx(
                "flex flex-col items-center justify-center h-full transition-colors duration-200",
                getPathColor(path, item.href),
              )}
              style={{
                flex: "1 1 0%", // 均等幅
                minWidth: 0, // テキストの長さに関係なく均等に
              }}
            >
              <IconComponent size={20} className="mb-1" />
              <span className="text-xs break-words word-break-break-all whitespace-normal max-w-full px-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
