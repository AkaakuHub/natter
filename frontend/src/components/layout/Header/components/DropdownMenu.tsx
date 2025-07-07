import React from "react";
import {
  IconUser,
  IconLogout,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
} from "@tabler/icons-react";
import { useTheme, Theme } from "@/hooks/useTheme";

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
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const getThemeIcon = (themeType: Theme) => {
    switch (themeType) {
      case "light":
        return <IconSun size={16} />;
      case "dark":
        return <IconMoon size={16} />;
      case "system":
        return <IconDeviceDesktop size={16} />;
    }
  };

  const getThemeLabel = (themeType: Theme) => {
    switch (themeType) {
      case "light":
        return "ライト";
      case "dark":
        return "ダーク";
      case "system":
        return "システム";
    }
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-56 bg-surface-elevated rounded-xl shadow-lg border border-border overflow-hidden z-50">
      <button
        onClick={onProfileClick}
        className="w-full px-4 py-3 text-left hover:bg-surface-variant flex items-center gap-3 transition-colors"
      >
        <IconUser size={20} className="text-text-secondary" />
        <span className="text-text font-medium">プロフィール</span>
      </button>

      <div className="border-t border-border-muted" />

      {/* テーマ切り替えセクション */}
      <div className="px-4 py-3">
        <div className="text-xs text-text-muted mb-2">テーマ</div>
        <div className="space-y-1">
          {(["light", "dark", "system"] as Theme[]).map((themeType) => (
            <button
              key={themeType}
              onClick={() => handleThemeChange(themeType)}
              className={`flex items-center gap-2 w-full px-2 py-1 text-left text-sm rounded transition-colors ${
                theme === themeType
                  ? "bg-interactive/10 text-interactive"
                  : "text-text-secondary hover:bg-surface-variant"
              }`}
            >
              {getThemeIcon(themeType)}
              {getThemeLabel(themeType)}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border-muted" />

      <button
        onClick={onLogoutClick}
        className="w-full px-4 py-3 text-left hover:bg-error-bg flex items-center gap-3 transition-colors group"
      >
        <IconLogout
          size={20}
          className="text-text-secondary group-hover:text-error"
        />
        <span className="text-text font-medium group-hover:text-error">
          ログアウト
        </span>
      </button>
    </div>
  );
};

export default DropdownMenu;
