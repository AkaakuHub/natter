"use client";

import React from "react";
import { useToastAnimation } from "@/hooks/useToastAnimation";
import { toastColors, ToastType } from "@/utils/toastConfig";

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
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        isLeaving ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
      }`}
      onClick={onClick}
    >
      <div
        className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl ${toastColors[type]} min-w-[350px] max-w-[600px] backdrop-blur-lg transform transition-all duration-300 hover:scale-105 ${
          onClick ? "cursor-pointer" : ""
        }`}
      >
        <ToastIcon type={type} />
        <ToastMessage message={message} type={type} />
        <CloseButton onClose={handleClose} />
      </div>
    </div>
  );
};

export default Toast;
