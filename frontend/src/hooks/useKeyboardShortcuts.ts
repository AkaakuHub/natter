import { useCallback } from "react";

interface UseKeyboardShortcutsProps {
  onSubmit?: () => void;
  /** Additional conditions that must be true for submission */
  canSubmit?: boolean;
}

export const useKeyboardShortcuts = ({
  onSubmit,
  canSubmit = true,
}: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      // Ctrl+Enter (Windows/Linux) または Cmd+Enter (Mac) で送信
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        onSubmit &&
        canSubmit
      ) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit, canSubmit],
  );

  return { handleKeyDown };
};
