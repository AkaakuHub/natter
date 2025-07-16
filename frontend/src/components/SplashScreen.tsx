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
    // React StrictModeでの重複実行を防ぐ
    let mounted = true;

    const handleInitialSplash = () => {
      const initialSplash = document.getElementById("initial-splash");
      if (initialSplash && initialSplash.parentNode && mounted) {
        console.log("🎭 Hiding initial splash, showing React splash");

        // Reactのバッチ更新を避けるため、非同期で実行
        requestAnimationFrame(() => {
          if (mounted && initialSplash.parentNode) {
            initialSplash.style.opacity = "0";
            initialSplash.style.pointerEvents = "none";

            // 遅延削除もより安全に
            setTimeout(() => {
              if (mounted && initialSplash && initialSplash.parentNode) {
                try {
                  initialSplash.parentNode.removeChild(initialSplash);
                } catch (error) {
                  console.warn("Failed to remove initial splash:", error);
                }
              }
            }, 500);
          }
        });
      }
    };

    handleInitialSplash();

    // 初期スプラッシュで既に画像が表示されているので、即座に読み込み完了とする
    console.log("🖼️ Logo already displayed in initial splash");
    setLogoLoaded(true);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    console.log("🖼️ Splash screen state:", { isLoading, logoLoaded });
    // 実際の読み込み完了時にフェードアウトアニメーション付きで切り替え
    if (!isLoading && logoLoaded && isVisible) {
      console.log("🎉 Splash screen completing!");

      // アニメーション用のクラスを追加
      const splashElement = document.querySelector(".splash-screen");
      if (splashElement) {
        splashElement.classList.add("fade-out");

        // アニメーション完了を待ってからコンポーネントを非表示
        splashElement.addEventListener(
          "transitionend",
          () => {
            setIsVisible(false);
            onComplete?.();
          },
          { once: true },
        );
      }
    }
  }, [isLoading, logoLoaded, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="splash-screen">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* ロゴ */}
        <div className="w-32 h-32 md:w-40 md:h-40">
          <img
            src="/images/logo.png"
            alt="Natter Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* アプリ名 */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-wide text-text">
            Natter
          </h1>
          <p className="text-lg md:text-xl font-light text-text-secondary">
            Connect & Share
          </p>
        </div>

        {/* 進捗バー */}
        <div className="w-80 max-w-sm mx-auto">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-text-secondary">
                {currentStep}
              </span>
              <span className="text-sm font-mono text-text-secondary">
                {progress}%
              </span>
            </div>
            <div className="w-full rounded-full h-2 overflow-hidden bg-surface-secondary">
              <div
                style={{ width: `${progress}%` }}
                className="h-2 rounded-full transition-all duration-500 ease-out bg-interactive"
              />
            </div>
          </div>
        </div>

        {/* ローディングドット */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bounce-dot bg-text-secondary"></div>
          <div className="w-2 h-2 rounded-full bounce-dot bg-text-secondary"></div>
          <div className="w-2 h-2 rounded-full bounce-dot bg-text-secondary"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
