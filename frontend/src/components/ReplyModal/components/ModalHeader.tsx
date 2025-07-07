import React from "react";
import { IconX } from "@tabler/icons-react";

interface ModalHeaderProps {
  onClose: () => void;
}

const ModalHeader = ({ onClose }: ModalHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <h2 className="text-lg font-semibold">リプライを投稿</h2>
      <button
        onClick={onClose}
        className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full p-2 transition-colors duration-200"
      >
        <IconX size={20} />
      </button>
    </div>
  );
};

export default ModalHeader;