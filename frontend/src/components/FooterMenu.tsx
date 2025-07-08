"use client";

import { IconHome, IconVinyl, IconBell, IconSearch } from "@tabler/icons-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

const items = [
  { label: "ホーム", icon: IconHome, href: "/" },
  { label: "検索", icon: IconSearch, href: "/search" },
  { label: "通知", icon: IconBell, href: "/notification" },
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

interface BottomMenuProps {
  path: string;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function FooterMenu({ path, scrollContainerRef }: BottomMenuProps) {
  const router = useRouter();

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
      // Refを使ってスクロールコンテナにアクセス
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

      return;
    }

    router.push(href);
  };

  return (
    <footer className="h-[60px] fixed bottom-0 left-0 right-0 border-t border-border bg-surface z-10">
      <nav className="flex justify-between items-center max-w-md mx-auto py-2">
        {items.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.href)}
              className={clsx(
                "flex flex-col items-center justify-center w-full text-center transition-all duration-300",
                availableColor(path, item.href),
              )}
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
