"use client";

import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-interactive"></div>
    </div>
  );
};

export default LoadingSpinner;
