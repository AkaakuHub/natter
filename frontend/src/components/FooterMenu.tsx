"use client";

import { IconHome, IconVinyl, IconBell } from "@tabler/icons-react";
import clsx from "clsx";
import { useNavigation } from "@/hooks/useNavigation";

const items = [
  { label: "ホーム", icon: IconHome, href: "/" },
  { label: "通知", icon: IconBell, href: "/notification" },
  { label: "セトリ", icon: IconVinyl, href: "/set-list" },
];

function availableColor(pathname: string, href: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const isAvailable =
    href === "/"
      ? normalizedPath === href || ["items", "stores"].includes(pathname)
      : normalizedPath.startsWith(href);

  return isAvailable ? "text-blue-500" : "text-gray-500";
}

interface BottomMenuProps {
  path: string;
}

export function FooterMenu({ path }: BottomMenuProps) {
  const { navigateToTimeline } = useNavigation();

  const handleNavigation = (href: string) => {
    if (href === "/") {
      navigateToTimeline();
    } else {
      // For now, only handle home navigation
      // Other routes can be implemented as needed
      window.location.href = href;
    }
  };

  return (
    <footer className="h-[60px] fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-10">
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
