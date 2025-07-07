import { useState, useCallback } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

interface UseDropdownResult {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  ref: React.RefObject<HTMLDivElement>;
}

export const useDropdown = (): UseDropdownResult => {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const { ref } = useClickOutside<HTMLDivElement>(close);

  return {
    isOpen,
    toggle,
    close,
    ref,
  };
};
