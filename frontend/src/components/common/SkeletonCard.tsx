import React from "react";

const SkeletonCard = () => {
  return (
    <div className="border-b border-border-muted bg-surface animate-pulse">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Avatar skeleton */}
          <div className="w-12 h-12 bg-surface-variant rounded-full flex-shrink-0" />

          <div className="flex-1 min-w-0">
            {/* Name and handle skeleton */}
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-4 w-20 bg-surface-variant rounded" />
              <div className="h-4 w-16 bg-surface-variant rounded" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-4 w-full bg-surface-variant rounded" />
              <div className="h-4 w-3/4 bg-surface-variant rounded" />
              <div className="h-4 w-1/2 bg-surface-variant rounded" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex items-center space-x-8">
              <div className="h-4 w-8 bg-surface-variant rounded" />
              <div className="h-4 w-8 bg-surface-variant rounded" />
              <div className="h-4 w-8 bg-surface-variant rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
