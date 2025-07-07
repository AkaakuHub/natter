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
    <div className="absolute top-0 left-0 right-0 z-20 bg-white p-6">
      <div className="flex items-center justify-between">
        {hasMultiple && (
          <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
            {currentIndex + 1} / {totalImages}
          </div>
        )}
        <div className="flex-1"></div>
        <button
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full p-3 transition-colors duration-200"
        >
          <IconX size={20} />
        </button>
      </div>
    </div>
  );
};

export default ModalHeader;
