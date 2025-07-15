"use client";

import React from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { useServerStatus } from "@/contexts/ServerStatusContext";

interface ServerErrorBannerProps {
  className?: string;
}

const ServerErrorBanner: React.FC<ServerErrorBannerProps> = ({
  className = "",
}) => {
  const { isOnline, error, checkStatus } = useServerStatus();

  if (isOnline !== false) {
    return null;
  }

  return (
    <div
      className={`bg-error/10 border border-error/20 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <IconAlertTriangle
          className="text-error flex-shrink-0 mt-0.5"
          size={20}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-error font-medium text-sm mb-1">
            サーバーに接続できません
          </h3>
          <p className="text-error/80 text-xs">
            {error ||
              "サーバーに問題があります。しばらく待ってから再度お試しください。"}
          </p>
        </div>
        <button
          onClick={checkStatus}
          className="flex-shrink-0 p-1 text-error/70 hover:text-error transition-colors"
          title="再試行"
        >
          <IconRefresh size={16} />
        </button>
      </div>
    </div>
  );
};

export default ServerErrorBanner;
