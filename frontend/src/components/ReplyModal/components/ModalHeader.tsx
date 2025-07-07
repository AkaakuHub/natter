import React from "react";
import { IconX } from "@tabler/icons-react";

interface ModalHeaderProps {
  onClose: () => void;
}

const ModalHeader = ({ onClose }: ModalHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border-muted">
      <h2 className="text-lg font-semibold text-text">リプライを投稿</h2>
      <button
        onClick={onClose}
        className="bg-surface-variant hover:bg-surface-hover text-text-muted hover:text-text rounded-full p-2 transition-colors duration-200"
      >
        <IconX size={20} />
      </button>
    </div>
  );
};

export default ModalHeader;
