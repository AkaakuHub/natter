import React from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { ui } from "@/styles/ui";

interface BackButtonProps {
  onBack: () => void;
}

const BackButton = ({ onBack }: BackButtonProps) => {
  return (
    <button onClick={onBack} className={`${ui.button.action} mb-6`}>
      <IconArrowLeft size={20} />
      <span className="font-medium">戻る</span>
    </button>
  );
};

export default BackButton;
