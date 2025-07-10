import { useEffect, useCallback } from "react";
import { useNavigation } from "@/hooks/useNavigation";

interface UseGlobalKeyboardShortcutsProps {
  onCreatePost?: () => void;
  onSearch?: () => void;
  onHome?: () => void;
  onProfile?: () => void;
  onNotifications?: () => void;
  onHelp?: () => void;
  isModalOpen?: boolean;
  isInputFocused?: boolean;
}

export const useGlobalKeyboardShortcuts = ({
  onCreatePost,
  onSearch,
  onHome,
  onProfile,
  onNotifications,
  onHelp,
  isModalOpen = false,
  isInputFocused = false,
}: UseGlobalKeyboardShortcutsProps) => {
  const {
    navigateToTimeline,
    navigateToProfile,
    navigateToNotification,
    navigateToSearch,
  } = useNavigation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // モーダルが開いている場合、または入力フィールドにフォーカスがある場合はスキップ
      if (isModalOpen || isInputFocused) {
        return;
      }

      // 修飾キーが押されている場合はスキップ（Ctrl+n等を防ぐため）
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // input, textarea, select要素にフォーカスがある場合はスキップ
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.hasAttribute("contenteditable"))
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          onCreatePost?.();
          break;
        case "/":
          e.preventDefault();
          console.log("🔥 [KeyboardShortcut] Navigating to search");
          onSearch?.();
          navigateToSearch();
          break;
        case "h":
          e.preventDefault();
          console.log("🔥 [KeyboardShortcut] Navigating to home");
          onHome?.();
          navigateToTimeline();
          break;
        case "p":
          e.preventDefault();
          console.log("🔥 [KeyboardShortcut] Navigating to profile");
          onProfile?.();
          navigateToProfile();
          break;
        case "i":
          e.preventDefault();
          console.log("🔥 [KeyboardShortcut] Navigating to notifications");
          onNotifications?.();
          navigateToNotification();
          break;
        case "g":
          // gキーは後続のキーと組み合わせて使用（今後の拡張用）
          e.preventDefault();
          break;
        case "?":
          e.preventDefault();
          onHelp?.();
          break;
        default:
          break;
      }
    },
    [
      onCreatePost,
      onSearch,
      onHome,
      onProfile,
      onNotifications,
      onHelp,
      isModalOpen,
      isInputFocused,
      navigateToTimeline,
      navigateToProfile,
      navigateToNotification,
      navigateToSearch,
    ],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // ショートカットの状態を返す（デバッグ用）
    isActive: !isModalOpen && !isInputFocused,
  };
};
