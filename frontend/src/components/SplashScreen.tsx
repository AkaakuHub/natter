"use client";

import { useEffect, useState } from "react";
import { useAppInitialization } from "@/hooks/useAppInitialization";

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { isLoading, progress, currentStep } = useAppInitialization();

  // ReactのSplashScreenが読み込まれたら初期スプラッシュを隠す
  useEffect(() => {
    const initialSplash = document.getElementById("initial-splash");
    if (initialSplash && initialSplash.parentNode) {
      console.log("🎭 Hiding initial splash, showing React splash");
      initialSplash.classList.add("hidden");

      // 少し遅延を入れてから安全に削除
      setTimeout(() => {
        if (initialSplash.parentNode) {
          try {
            initialSplash.parentNode.removeChild(initialSplash);
          } catch (error) {
            console.warn("Failed to remove initial splash:", error);
          }
        }
      }, 300);
    }

    // 初期スプラッシュで既に画像が表示されているので、即座に読み込み完了とする
    console.log("🖼️ Logo already displayed in initial splash");
    setLogoLoaded(true);
  }, []);

  useEffect(() => {
    console.log("🖼️ Splash screen state:", { isLoading, logoLoaded });
    // 実際の読み込み完了時に即座に切り替え
    if (!isLoading && logoLoaded) {
      console.log("🎉 Splash screen completing!");
      setIsVisible(false);
      onComplete?.();
    }
  }, [isLoading, logoLoaded, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="splash-screen">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* ロゴ（CSS版で既に表示されているので、スペースのみ確保） */}
        <div className="w-32 h-32 md:w-40 md:h-40"></div>

        {/* アプリ名（CSS版で既に表示されているので、スペースのみ確保） */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent mb-2 tracking-wide">
            Natter
          </h1>
          <p className="text-transparent text-lg md:text-xl font-light">
            Connect & Share
          </p>
        </div>

        {/* 進捗バー */}
        <div className="w-80 max-w-sm mx-auto">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-inverse/90 text-sm font-medium">
                {currentStep}
              </span>
              <span className="text-text-inverse/70 text-sm font-mono">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-text-inverse/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-text-inverse/70 to-text-inverse/90 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ローディングドット */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-text-inverse/60 rounded-full bounce-dot"></div>
          <div className="w-2 h-2 bg-text-inverse/60 rounded-full bounce-dot"></div>
          <div className="w-2 h-2 bg-text-inverse/60 rounded-full bounce-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
