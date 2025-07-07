import React from "react";

interface ErrorMessageProps {
  error?: string | null;
}

const ErrorMessage = ({ error }: ErrorMessageProps) => {
  if (!error) return null;

  return <div className="mt-2 text-red-500 text-sm">{error}</div>;
};

export default ErrorMessage;