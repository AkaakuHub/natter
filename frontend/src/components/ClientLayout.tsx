"use client";

import { useState } from "react";
import SplashScreen from "./SplashScreen";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // スプラッシュスクリーン完了後に背景を元に戻す
    document.documentElement.style.background = "";
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={`${showSplash ? "opacity-0" : "opacity-100"}`}>
        {children}
      </div>
    </>
  );
};

export default ClientLayout;
