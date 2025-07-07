"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { useNavigation } from "@/hooks/useNavigation";
import { useDropdown } from "@/hooks/useDropdown";

import ProfileDropdown from "./Header/components/ProfileDropdown";
import DropdownMenu from "./Header/components/DropdownMenu";
import Logo from "./Header/components/Logo";

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
  const { navigateToProfile } = useNavigation();
  const { isOpen, toggle, close, ref } = useDropdown();

  const handleNavigateToProfile = () => {
    close();
    if (profileOnClick) {
      profileOnClick();
    } else {
      navigateToProfile(userId);
    }
  };

  const handleLogout = async () => {
    close();
    await signOut();
  };

  return (
    <header className="h-[64px] border-b border-gray-200 p-4 relative flex items-center justify-between bg-white">
      <div className="relative" ref={ref}>
        <ProfileDropdown
          profileImage={profileImage}
          progress={progress}
          isOpen={isOpen}
          onClick={toggle}
        />

        <DropdownMenu
          isOpen={isOpen}
          onProfileClick={handleNavigateToProfile}
          onLogoutClick={handleLogout}
        />
      </div>

      <Logo />

      <div className="w-8"></div>
    </header>
  );
};

export default Header;
