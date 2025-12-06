import React from "react";
import { IconX } from "@tabler/icons-react";

interface CloseButtonProps {
  onClose: () => void;
}

const CloseButton = ({ onClose }: CloseButtonProps) => {
  return (
    <button
      onClick={onClose}
      className="flex-shrink-0 ml-2 text-text-muted hover:text-text transition-colors"
      aria-label="閉じる"
    >
      <IconX size={16} />
    </button>
  );
};

export default CloseButton;
