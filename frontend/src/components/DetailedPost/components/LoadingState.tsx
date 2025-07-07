import React from "react";

const LoadingState = () => {
  return (
    <div className="bg-surface-variant min-h-full">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-xl shadow-md border border-border p-8">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-surface-variant rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-surface-variant rounded w-32"></div>
                <div className="h-3 bg-surface-variant rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-surface-variant rounded"></div>
              <div className="h-4 bg-surface-variant rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
