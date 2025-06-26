import React from "react";
import Image from "next/image";
import { IconMenu2 } from "@tabler/icons-react";

interface HeaderProps {
  profileImage?: string;
  profileOnClick?: () => void;
  progress: number;
  onMenuClick?: () => void;
}

const Header = ({ profileImage, profileOnClick, progress, onMenuClick }: HeaderProps) => {
  return (
    <header className="h-[64px] border-b border-gray-200 p-4 relative flex items-center justify-between">
      {/* Left side - Menu button (mobile) or Profile image */}
      <div className="flex items-center">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden mr-3 p-1 hover:bg-gray-100 rounded"
          >
            <IconMenu2 size={24} />
          </button>
        )}
        {profileImage ? (
          <Image
            src={profileImage}
            alt={profileImage}
            width={32}
            height={32}
            className="rounded-full cursor-pointer hover:opacity-80 transition-opacity"
            onClick={profileOnClick}
            style={{ opacity: progress }}
          />
        ) : (
          <div className="rounded-full w-8 h-8 bg-gray-300" />
        )}
      </div>

      {/* Center - Logo */}
      <Image
        src="/web-app-manifest-192x192.png"
        alt="logo"
        width={32}
        height={32}
        className="absolute left-1/2 transform -translate-x-1/2"
      />

      {/* Right side - Empty for now */}
      <div className="w-8"></div>
    </header>
  );
};

export default Header;