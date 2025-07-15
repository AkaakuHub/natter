"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useServerStatus } from "@/contexts/ServerStatusContext";

interface LoadingState {
  isLoading: boolean;
  progress: number;
  currentStep: string;
  steps: {
    fonts: boolean;
    authentication: boolean;
    serverConnection: boolean;
    initialData: boolean;
    timelineData: boolean;
  };
}

export const useAppInitialization = () => {
  const { data: session, status } = useSession();
  const { isOnline } = useServerStatus();

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    currentStep: "Initializing...",
    steps: {
      fonts: false,
      authentication: false,
      serverConnection: false,
      initialData: false,
      timelineData: false,
    },
  });

  // フォント読み込み状況を追跡
  useEffect(() => {
    const checkFonts = async () => {
      try {
        if (document.fonts) {
          await document.fonts.ready;
          console.log("🔤 Fonts loaded");
          setLoadingState((prev) => ({
            ...prev,
            steps: { ...prev.steps, fonts: true },
            currentStep: "Loading fonts...",
          }));
        } else {
          // フォントAPIがサポートされていない場合は短時間で完了とする
          setTimeout(() => {
            console.log("🔤 Fonts API not supported, skipping");
            setLoadingState((prev) => ({
              ...prev,
              steps: { ...prev.steps, fonts: true },
              currentStep: "Loading fonts...",
            }));
          }, 500);
        }
      } catch (error) {
        console.warn("Font loading detection failed:", error);
        setLoadingState((prev) => ({
          ...prev,
          steps: { ...prev.steps, fonts: true },
          currentStep: "Loading fonts...",
        }));
      }
    };

    checkFonts();
  }, []);

  // 認証状態を追跡
  useEffect(() => {
    console.log("🔐 Auth status:", status);
    if (status !== "loading") {
      console.log("🔐 Authentication completed");
      setLoadingState((prev) => ({
        ...prev,
        steps: { ...prev.steps, authentication: true },
        currentStep: "Checking authentication...",
      }));
    }
  }, [status]);

  // サーバー接続状態を追跡（既存のServerStatusContextを使用）
  useEffect(() => {
    console.log("🌐 Server status:", isOnline);
    if (isOnline !== null) {
      console.log("🌐 Server connection check completed");
      setLoadingState((prev) => ({
        ...prev,
        steps: { ...prev.steps, serverConnection: true },
        currentStep: "Connecting to server...",
      }));
    }
  }, [isOnline]);

  // 初期データの取得（認証とサーバー接続が完了後）
  useEffect(() => {
    console.log("💾 Initial data check:", {
      auth: loadingState.steps.authentication,
      server: loadingState.steps.serverConnection,
    });

    if (
      loadingState.steps.authentication &&
      loadingState.steps.serverConnection
    ) {
      console.log("💾 Loading initial data...");
      // 基本的な初期データの取得をシミュレート
      const loadInitialData = async () => {
        try {
          // 最小限の初期データを取得
          if (session?.user?.id) {
            // 認証済みユーザーの場合、基本情報を取得
            await new Promise((resolve) => setTimeout(resolve, 300));
          } else {
            // 未認証の場合はより短時間で完了
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          console.log("💾 Initial data loaded");
          setLoadingState((prev) => ({
            ...prev,
            steps: { ...prev.steps, initialData: true },
            currentStep: "Loading initial data...",
          }));
        } catch (error) {
          console.warn("Initial data loading failed:", error);
          setLoadingState((prev) => ({
            ...prev,
            steps: { ...prev.steps, initialData: true },
            currentStep: "Loading initial data...",
          }));
        }
      };

      loadInitialData();
    }
  }, [
    loadingState.steps.authentication,
    loadingState.steps.serverConnection,
    session,
  ]);

  // タイムラインデータの読み込み状況を追跡
  useEffect(() => {
    // タイムラインデータの読み込み完了を監視するイベントリスナーを追加
    const handleTimelineLoaded = () => {
      console.log("🎯 Timeline loaded event received");
      setLoadingState((prev) => ({
        ...prev,
        steps: { ...prev.steps, timelineData: true },
        currentStep: "Loading timeline...",
      }));
    };

    window.addEventListener("timelineLoaded", handleTimelineLoaded);

    // サーバーがオフラインの場合はタイムラインデータをスキップ
    if (isOnline === false) {
      console.log("📱 Server offline, skipping timeline data");
      setLoadingState((prev) => ({
        ...prev,
        steps: { ...prev.steps, timelineData: true },
        currentStep: "Loading timeline...",
      }));
    }

    return () => {
      window.removeEventListener("timelineLoaded", handleTimelineLoaded);
    };
  }, [isOnline]);

  // 進捗状況を計算
  useEffect(() => {
    const completedSteps = Object.values(loadingState.steps).filter(
      Boolean,
    ).length;
    const totalSteps = Object.keys(loadingState.steps).length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    console.log("🔍 Loading steps:", loadingState.steps);
    console.log(`📊 Progress: ${completedSteps}/${totalSteps} (${progress}%)`);

    setLoadingState((prev) => ({
      ...prev,
      progress,
      isLoading: progress < 100,
    }));

    // 全てのステップが完了したら最終メッセージを表示
    if (progress === 100) {
      console.log("✅ All steps completed!");
      setLoadingState((prev) => ({
        ...prev,
        currentStep: "Ready!",
      }));
    }
  }, [loadingState.steps]);

  return {
    isLoading: loadingState.isLoading,
    progress: loadingState.progress,
    currentStep: loadingState.currentStep,
    steps: loadingState.steps,
  };
};
