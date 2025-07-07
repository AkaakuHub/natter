import React from "react";
import { toastIcons, ToastType } from "@/utils/toastConfig";

interface ToastIconProps {
  type: ToastType;
}

const ToastIcon = ({ type }: ToastIconProps) => {
  const IconComponent = toastIcons[type];
  const iconProps = type === "success" ? { className: "animate-scale-in" } : {};

  return (
    <div className="flex-shrink-0 bg-white/20 rounded-full p-2">
      <IconComponent size={24} {...iconProps} />
    </div>
  );
};

export default ToastIcon;