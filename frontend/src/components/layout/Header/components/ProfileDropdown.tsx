import React from "react";
import Image from "next/image";
import { IconChevronDown } from "@tabler/icons-react";
import { ui } from "@/styles/ui";

interface ProfileDropdownProps {
  profileImage?: string;
  progress: number;
  isOpen: boolean;
  onClick: () => void;
}

const ProfileDropdown = ({
  profileImage,
  progress,
  isOpen,
  onClick,
}: ProfileDropdownProps) => {
  return (
    <button onClick={onClick} className={`${ui.button.action} p-1 pr-3`}>
      {profileImage ? (
        <Image
          src={profileImage}
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
          style={{ opacity: progress }}
          priority
        />
      ) : (
        <div className="rounded-full w-8 h-8 bg-surface-variant" />
      )}
      <IconChevronDown
        size={16}
        className={`text-text-muted transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};

export default ProfileDropdown;
