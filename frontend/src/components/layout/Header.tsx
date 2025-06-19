import React from "react";
import Image from "next/image";

interface HeaderProps {
  profileImage?: string;
  profileOnClick?: () => void;
  progress: number;
}

const Header = ({ profileImage, profileOnClick, progress }: HeaderProps) => {
  return (
    <header className="h-[64px] border-b border-gray-200 p-4 relative flex items-center">
      {profileImage ? (
        <Image
          src={profileImage}
          alt={profileImage}
          width={32}
          height={32}
          className="rounded-full"
          onClick={profileOnClick}
          style={{ opacity: progress }}
        />
      ) : (
        <div className="rounded-full w-8 h-8 bg-gray-300" />
      )}
      <Image
        src="/web-app-manifest-192x192.png"
        alt="logo"
        width={32}
        height={32}
        className="absolute left-1/2 transform -translate-x-1/2"
      />
    </header>
  );
};

export default Header;