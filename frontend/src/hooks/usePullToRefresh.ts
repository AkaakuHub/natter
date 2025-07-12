import { useRef, useCallback, useState } from "react";
import { audioPlayer } from "@/utils/audioUtils";

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  enableSound?: boolean;
}

interface PullToRefreshResult {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  bindTouchEvents: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  enableSound = true,
}: PullToRefreshOptions): PullToRefreshResult => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const scrollElement = useRef<Element | null>(null);
  const hasPlayedSound = useRef<boolean>(false);

  // 音声再生関数
  const playRefreshSound = useCallback(() => {
    if (!enableSound || hasPlayedSound.current) return;

    audioPlayer.playRefreshSound();
    hasPlayedSound.current = true;
  }, [enableSound]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // スクロール要素を取得
    scrollElement.current = e.currentTarget as Element;

    // 最上部にいるかチェック
    if (scrollElement.current.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
    hasPlayedSound.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!scrollElement.current || scrollElement.current.scrollTop > 0) {
        if (isPulling) {
          setIsPulling(false);
          setPullDistance(0);
        }
        return;
      }

      currentY.current = e.touches[0].clientY;
      const deltaY = currentY.current - startY.current;

      if (deltaY > 0) {
        // 引っ張り動作
        e.preventDefault(); // デフォルトのスクロールを防止

        const distance = Math.min(deltaY * 0.5, maxPullDistance); // 抵抗感を演出
        setPullDistance(distance);

        if (distance > 20 && !isPulling) {
          setIsPulling(true);
        }

        // 閾値を超えたら音を鳴らす
        if (distance >= threshold && enableSound) {
          playRefreshSound();
        }
      }
    },
    [isPulling, threshold, maxPullDistance, enableSound, playRefreshSound],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    if (pullDistance >= threshold) {
      // リフレッシュ実行
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
      }
    }

    // 状態をリセット
    setIsPulling(false);
    setPullDistance(0);
    hasPlayedSound.current = false;
  }, [isPulling, pullDistance, threshold, onRefresh]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    bindTouchEvents: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
