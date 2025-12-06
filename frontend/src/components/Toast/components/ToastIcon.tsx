import React from "react";
import {
  toastIcons,
  toastIconBackground,
  ToastType,
} from "@/utils/toastConfig";

interface ToastIconProps {
  type: ToastType;
}

const ToastIcon = ({ type }: ToastIconProps) => {
  const IconComponent = toastIcons[type];
  const iconProps = type === "success" ? { className: "animate-scale-in" } : {};

  return (
    <div
      className={`flex-shrink-0 rounded-full p-2 ${toastIconBackground[type]}`}
    >
      <IconComponent size={20} {...iconProps} />
    </div>
  );
};

export default ToastIcon;
