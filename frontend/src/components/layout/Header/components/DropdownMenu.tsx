import React from "react";
import { IconUser, IconLogout } from "@tabler/icons-react";

interface DropdownMenuProps {
  isOpen: boolean;
  onProfileClick: () => void;
  onLogoutClick: () => void;
}

const DropdownMenu = ({
  isOpen,
  onProfileClick,
  onLogoutClick,
}: DropdownMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
      <button
        onClick={onProfileClick}
        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
      >
        <IconUser size={20} className="text-gray-600" />
        <span className="text-gray-700 font-medium">プロフィール</span>
      </button>
      <div className="border-t border-gray-100" />
      <button
        onClick={onLogoutClick}
        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors group"
      >
        <IconLogout
          size={20}
          className="text-gray-600 group-hover:text-red-500"
        />
        <span className="text-gray-700 font-medium group-hover:text-red-500">
          ログアウト
        </span>
      </button>
    </div>
  );
};

export default DropdownMenu;
