"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ServerStatusContextType {
  isOnline: boolean | null; // null = 未チェック
  error: string | null;
  lastChecked: Date | null;
  checkStatus: () => Promise<void>;
}

const ServerStatusContext = createContext<ServerStatusContextType | undefined>(
  undefined,
);

export const useServerStatus = () => {
  const context = useContext(ServerStatusContext);
  if (context === undefined) {
    throw new Error("useServerStatus must be used within ServerStatusProvider");
  }
  return context;
};

interface ServerStatusProviderProps {
  children: React.ReactNode;
}

export const ServerStatusProvider: React.FC<ServerStatusProviderProps> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null); // 初期状態は未チェック
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/backend/users", {
        credentials: "include",
        method: "HEAD",
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        setIsOnline(true);
        setError(null);
      } else {
        setIsOnline(false);
        setError(`サーバーエラー: HTTP ${response.status}`);
      }
    } catch (err) {
      setIsOnline(false);
      if (err instanceof Error) {
        if (err.name === "TimeoutError") {
          setError("サーバーへの接続がタイムアウトしました");
        } else if (err.message.includes("fetch")) {
          setError("サーバーに接続できません");
        } else {
          setError(`サーバーに問題があります: ${err.message}`);
        }
      } else {
        setError("サーバーに問題があります");
      }
    } finally {
      setLastChecked(new Date());
    }
  };

  // 初回チェック
  useEffect(() => {
    checkStatus();
  }, []);

  // 定期的なヘルスチェック（30秒間隔）
  useEffect(() => {
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // ネットワーク状態の変化を監視
  useEffect(() => {
    const handleOnline = () => {
      console.log("ネットワークが復旧しました。サーバー状態を確認中...");
      checkStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError("ネットワーク接続がありません");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ServerStatusContext.Provider
      value={{ isOnline, error, lastChecked, checkStatus }}
    >
      {children}
    </ServerStatusContext.Provider>
  );
};
