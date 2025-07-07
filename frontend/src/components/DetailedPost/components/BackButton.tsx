import React from "react";
import { IconArrowLeft } from "@tabler/icons-react";

interface BackButtonProps {
  onBack: () => void;
}

const BackButton = ({ onBack }: BackButtonProps) => {
  return (
    <button
      onClick={onBack}
      className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-all duration-300 group p-2 rounded-full hover:bg-blue-50"
    >
      <IconArrowLeft
        size={20}
        className="group-hover:-translate-x-1 transition-transform"
      />
      <span className="font-medium">戻る</span>
    </button>
  );
};

export default BackButton;