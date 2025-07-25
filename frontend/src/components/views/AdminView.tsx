"use client";

import { useEffect, useState } from "react";
import { useSPANavigation } from "@/core/spa/SPANavigation";
import { useSession } from "next-auth/react";
import { ApiClient } from "@/api/client";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface AdminSettings {
  isRevealedSecrets: boolean;
}

interface AdminStatusResponse {
  isAdmin: boolean;
}

export default function AdminView() {
  const { navigateToPath } = useSPANavigation();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      navigateToPath("/");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const checkAdminStatus = async () => {
        try {
          const adminData =
            await ApiClient.get<AdminStatusResponse>("/admin/status");
          setIsAdmin(adminData.isAdmin);

          if (adminData.isAdmin) {
            const settingsData =
              await ApiClient.get<AdminSettings>("/admin/settings");
            setSettings(settingsData);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      };

      checkAdminStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, navigateToPath]);

  const toggleRevealedSecrets = async () => {
    if (!settings) return;

    setUpdating(true);
    try {
      const data = await ApiClient.post<AdminSettings>(
        "/admin/toggle-secrets",
        {
          isRevealedSecrets: !settings.isRevealedSecrets,
        },
      );
      setSettings(data);
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-variant">
        <h1 className="text-2xl font-bold mb-4 text-text">アクセス拒否</h1>
        <p className="text-text-secondary mb-4">戻ってください</p>
        <button
          onClick={() => navigateToPath("/")}
          className="px-4 py-2 bg-interactive text-text-inverse rounded-lg hover:bg-interactive-hover transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-text">管理者設定</h1>

      <div className="bg-surface rounded-lg shadow-lg p-6 border border-border">
        <h2 className="text-xl font-semibold mb-6 text-text">環境設定</h2>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-medium text-lg text-text">ネタバラシモード</h3>
            <p className="text-sm text-text-secondary mt-1">
              他のユーザーの隠し情報（URL、キャラクター名など）を表示するかどうか
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings?.isRevealedSecrets || false}
              onChange={toggleRevealedSecrets}
              disabled={updating || !settings}
            />
            <div
              className={`
              w-14 h-8 bg-surface-elevated rounded-full peer 
              dark:bg-surface-variant 
              peer-checked:after:translate-x-6
              peer-checked:after:border-surface
              after:content-[''] 
              after:absolute 
              after:top-1 
              after:left-1 
              after:bg-surface 
              after:rounded-full 
              after:h-6 
              after:w-6 
              after:transition-all 
              after:border
              after:border-border
              peer-checked:bg-interactive
              ${updating ? "opacity-50 cursor-not-allowed" : ""}
            `}
            ></div>
          </label>
        </div>
      </div>
    </div>
  );
}
