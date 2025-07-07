"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { IconLogout, IconUser, IconChevronDown } from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import { useNavigation } from "@/hooks/useNavigation";

interface HeaderProps {
  profileImage?: string;
  profileOnClick?: () => void;
  progress: number;
  userId?: string;
}

const Header = ({
  profileImage,
  profileOnClick,
  progress,
  userId,
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { navigateToProfile } = useNavigation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigateToProfile = () => {
    setIsMenuOpen(false);
    if (profileOnClick) {
      profileOnClick();
    } else {
      navigateToProfile(userId);
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut();
  };

  return (
    <header className="h-[64px] border-b border-gray-200 p-4 relative flex items-center justify-between bg-white">
      {/* Left side - Profile dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 pr-3 transition-colors"
        >
          {profileImage ? (
            <Image
              src={profileImage}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
              style={{ opacity: progress }}
            />
          ) : (
            <div className="rounded-full w-8 h-8 bg-gray-300" />
          )}
          <IconChevronDown
            size={16}
            className={`text-gray-600 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <button
              onClick={handleNavigateToProfile}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <IconUser size={20} className="text-gray-600" />
              <span className="text-gray-700 font-medium">プロフィール</span>
            </button>
            <div className="border-t border-gray-100" />
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors group"
            >
              <IconLogout size={20} className="text-gray-600 group-hover:text-red-500" />
              <span className="text-gray-700 font-medium group-hover:text-red-500">ログアウト</span>
            </button>
          </div>
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

      {/* Right side - Empty for balance */}
      <div className="w-8"></div>
    </header>
  );
};

export default Header;
