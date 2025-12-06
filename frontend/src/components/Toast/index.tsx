"use client";

import React from "react";
import { useToastAnimation } from "@/hooks/useToastAnimation";
import { toastContainerColors, ToastType } from "@/utils/toastConfig";

import ToastIcon from "./components/ToastIcon";
import ToastMessage from "./components/ToastMessage";
import CloseButton from "./components/CloseButton";

export type { ToastType };

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  onClick?: () => void;
}

const Toast = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
  onClick,
}: ToastProps) => {
  const { isVisible, isLeaving, handleClose } = useToastAnimation({
    duration,
    onClose,
  });

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isLeaving ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
      }`}
      onClick={onClick}
    >
      <div
        className={`flex items-center gap-3 rounded-2xl bg-surface text-text border shadow-md min-w-[280px] max-w-[420px] px-4 py-3 ${toastContainerColors[type]} ${
          onClick ? "cursor-pointer" : ""
        }`}
      >
        <ToastIcon type={type} />
        <ToastMessage message={message} />
        <CloseButton onClose={handleClose} />
      </div>
    </div>
  );
};

export default Toast;
