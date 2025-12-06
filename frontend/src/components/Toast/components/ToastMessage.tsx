import React from "react";
interface ToastMessageProps {
  message: string;
}

const ToastMessage = ({ message }: ToastMessageProps) => {
  return (
    <p className="flex-1 text-sm font-medium text-text leading-snug">
      {message}
    </p>
  );
};

export default ToastMessage;
