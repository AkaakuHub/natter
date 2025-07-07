import React from "react";
import { IconX } from "@tabler/icons-react";

interface ModalHeaderProps {
  hasMultiple: boolean;
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
}

const ModalHeader = ({
  hasMultiple,
  currentIndex,
  totalImages,
  onClose,
}: ModalHeaderProps) => {
  return (
    <div className="flex-shrink-0 px-6 py-4">
      <div className="flex items-center justify-between">
        {hasMultiple && (
          <div className="text-text-secondary text-sm font-medium">
            {currentIndex + 1} / {totalImages}
          </div>
        )}
        <div className="flex-1"></div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text hover:bg-surface-variant rounded-full p-2 transition-colors duration-200"
        >
          <IconX size={20} />
        </button>
      </div>
    </div>
  );
};

export default ModalHeader;
