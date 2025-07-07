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
          <div className="text-gray-600 text-sm font-medium">
            {currentIndex + 1} / {totalImages}
          </div>
        )}
        <div className="flex-1"></div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
        >
          <IconX size={20} />
        </button>
      </div>
    </div>
  );
};

export default ModalHeader;
