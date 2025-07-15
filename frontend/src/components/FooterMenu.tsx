"use client";

import clsx from "clsx";
import {
  useSPANavigation,
  getFooterMenuItems,
  getPathColor,
  isCurrentPage,
  scrollToTop,
  getIconComponent,
} from "@/core/spa";

const items = getFooterMenuItems();

interface BottomMenuProps {
  path: string;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function FooterMenu({ path, scrollContainerRef }: BottomMenuProps) {
  const { navigateToPath } = useSPANavigation();

  const handleNavigation = (href: string) => {
    // 現在のタブと同じページにいる場合はスムーズスクロール
    if (isCurrentPage(path, href)) {
      scrollToTop(scrollContainerRef);
      return;
    }

    // SPA navigation
    navigateToPath(href);
  };

  return (
    <footer className="h-[60px] fixed bottom-0 left-0 right-0 border-t border-border bg-surface z-10">
      <nav className="flex items-center h-full">
        {items.map((item, index) => {
          const IconComponent = getIconComponent(item.icon);
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.href)}
              className={clsx(
                "flex flex-col items-center justify-center h-full transition-all duration-300 active:bg-surface-hover touch-manipulation",
                getPathColor(path, item.href),
              )}
              style={{
                flex: "1 1 0%", // 均等幅
                minWidth: 0, // テキストの長さに関係なく均等に
              }}
            >
              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs mt-1 truncate max-w-full px-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
}
