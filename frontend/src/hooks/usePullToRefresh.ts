import { useRef, useCallback, useState, useEffect } from "react";
import { audioPlayer } from "@/utils/audioUtils";

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  enableSound?: boolean;
  disabled?: boolean;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

interface PullToRefreshResult {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  enableSound = true,
  disabled = false,
  scrollContainerRef: externalScrollContainerRef,
}: PullToRefreshOptions): PullToRefreshResult => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPlayedSound = useRef<boolean>(false);

  // 音声再生関数
  const playRefreshSound = useCallback(() => {
    if (!enableSound || hasPlayedSound.current) return;

    audioPlayer.playRefreshSound();
    hasPlayedSound.current = true;
  }, [enableSound]);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;

      // 外部から渡されたスクロールコンテナがあればそれを使用、なければ内部のcontainerRefを使用
      const scrollElement =
        externalScrollContainerRef?.current || containerRef.current;
      if (!scrollElement) return;

      // シンプルな最上部チェック：スクロールコンテナが一番上にスクロールされているかどうか
      const isAtTop = scrollElement.scrollTop === 0;

      console.log(
        "Touch start - scrollElement.scrollTop:",
        scrollElement.scrollTop,
      );
      console.log(
        "scrollElement type:",
        externalScrollContainerRef?.current ? "external" : "internal",
      );
      console.log("isAtTop:", isAtTop);

      if (!isAtTop) {
        console.log("Pull-to-refresh disabled: not at top");
        return;
      }

      console.log("Pull-to-refresh enabled");
      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
      hasPlayedSound.current = false;
    },
    [disabled, externalScrollContainerRef],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;

      // 外部から渡されたスクロールコンテナがあればそれを使用、なければ内部のcontainerRefを使用
      const scrollElement =
        externalScrollContainerRef?.current || containerRef.current;
      if (!scrollElement) return;

      // シンプルな最上部チェック：スクロールコンテナが一番上にスクロールされているかどうか
      const isAtTop = scrollElement.scrollTop === 0;

      if (!isAtTop) {
        if (isPulling) {
          setIsPulling(false);
          setPullDistance(0);
        }
        return;
      }

      currentY.current = e.touches[0].clientY;
      const deltaY = currentY.current - startY.current;

      if (deltaY > 0) {
        // 引っ張り動作（最上部でのみ）
        const distance = Math.min(deltaY * 0.5, maxPullDistance); // 抵抗感を演出
        setPullDistance(distance);

        if (distance > 20 && !isPulling) {
          setIsPulling(true);
        }

        // iOS Safari対策: より早い段階でpreventDefaultを呼び出し、一貫性を保つ
        if (distance > 5) {
          e.preventDefault(); // デフォルトのスクロールを防止
        }

        // 閾値を超えたら音を鳴らす
        if (distance >= threshold && enableSound) {
          playRefreshSound();
        }
      }
    },
    [
      disabled,
      externalScrollContainerRef,
      isPulling,
      threshold,
      maxPullDistance,
      enableSound,
      playRefreshSound,
    ],
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !isPulling) return;

    console.log(
      "Touch end - pullDistance:",
      pullDistance,
      "threshold:",
      threshold,
    );

    if (pullDistance >= threshold) {
      console.log("REFRESH TRIGGERED!");
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
  }, [disabled, isPulling, pullDistance, threshold, onRefresh]);

  // ネイティブイベントリスナーの設定
  useEffect(() => {
    // イベントリスナーは常に内部のcontainerRefにアタッチ（外部スクロールコンテナには影響しない）
    const element = containerRef.current;
    if (!element) return;

    console.log("Attaching event listeners to internal container");

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      console.log("Removing event listeners from internal container");
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    containerRef,
  };
};
