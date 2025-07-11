"use client";

import React from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useDropdown } from "@/hooks/useDropdown";
import { performCompleteLogout } from "@/utils/logout";

import ProfileDropdown from "./Header/components/ProfileDropdown";
import DropdownMenu from "./Header/components/DropdownMenu";
import Logo from "./Header/components/Logo";

interface HeaderProps {
  profileImage?: string;
  profileOnClick?: () => void;
  progress: number;
  userId?: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const Header = ({
  profileImage,
  profileOnClick,
  progress,
  userId,
  scrollContainerRef,
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
    await performCompleteLogout();
  };

  return (
    <header className="h-[64px] border-b border-border p-4 relative flex items-center justify-between bg-surface">
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

      <Logo scrollContainerRef={scrollContainerRef} />

      <div className="w-8"></div>
    </header>
  );
};

export default Header;
