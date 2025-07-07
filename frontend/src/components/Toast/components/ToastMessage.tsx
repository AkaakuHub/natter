import React from "react";
import { IconSparkles } from "@tabler/icons-react";
import { ToastType } from "@/utils/toastConfig";

interface ToastMessageProps {
  message: string;
  type: ToastType;
}

const ToastMessage = ({ message, type }: ToastMessageProps) => {
  return (
    <>
      <p className="flex-1 text-base font-semibold tracking-wide">{message}</p>
      {type === "success" && (
        <IconSparkles size={20} className="text-white/60 animate-pulse" />
      )}
    </>
  );
};

export default ToastMessage;