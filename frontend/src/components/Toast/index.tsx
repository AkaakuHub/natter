"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconInfoCircle,
  IconSparkles,
} from "@tabler/icons-react";

export type ToastType = "success" | "error" | "warning" | "info";

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
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  if (!isVisible) return null;

  const icons = {
    success: <IconCheck size={24} className="animate-scale-in" />,
    error: <IconX size={24} />,
    warning: <IconAlertCircle size={24} />,
    info: <IconInfoCircle size={24} />,
  };

  const colors = {
    success:
      "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30",
    error:
      "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/30",
    warning:
      "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/30",
    info: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/30",
  };

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        isLeaving ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
      }`}
      onClick={onClick}
    >
      <div
        className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl ${colors[type]} min-w-[350px] max-w-[600px] backdrop-blur-lg transform transition-all duration-300 hover:scale-105 ${
          onClick ? "cursor-pointer" : ""
        }`}
      >
        <div className="flex-shrink-0 bg-white/20 rounded-full p-2">
          {icons[type]}
        </div>
        <p className="flex-1 text-base font-semibold tracking-wide">
          {message}
        </p>
        {type === "success" && (
          <IconSparkles size={20} className="text-white/60 animate-pulse" />
        )}
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-all duration-200"
        >
          <IconX size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
