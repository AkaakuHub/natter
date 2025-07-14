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
      <nav className="flex justify-between items-center max-w-full mx-auto">
        {items.map((item, index) => {
          const IconComponent = getIconComponent(item.icon);
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.href)}
              className={clsx(
                "flex flex-col items-center justify-center w-full text-center transition-all duration-300 py-2 px-1 active:bg-surface-hover touch-manipulation",
                getPathColor(path, item.href),
              )}
              style={{ minHeight: "48px" }}
            >
              <IconComponent className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
}
