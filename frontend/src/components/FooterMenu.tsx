"use client";

import { IconHome, IconVinyl, IconBell } from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";

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
  return (
    <footer className="h-[60px] fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-20">
      <nav className="flex justify-between items-center max-w-md mx-auto py-2">
        {items.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={index}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center w-full text-center transition-all duration-300",
                availableColor(path, item.href)
              )}
            >
              <IconComponent className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
