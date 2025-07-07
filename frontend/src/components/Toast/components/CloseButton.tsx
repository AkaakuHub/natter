import React from "react";
import { IconX } from "@tabler/icons-react";

interface CloseButtonProps {
  onClose: () => void;
}

const CloseButton = ({ onClose }: CloseButtonProps) => {
  return (
    <button
      onClick={onClose}
      className="flex-shrink-0 ml-2 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-all duration-200"
    >
      <IconX size={18} />
    </button>
  );
};

export default CloseButton;
