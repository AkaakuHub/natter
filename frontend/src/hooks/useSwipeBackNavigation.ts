import { useEffect, useRef } from "react";
import { decideSwipeBackGesture } from "@/domain/navigation/swipeBackGesture";

interface UseSwipeBackNavigationOptions {
  disabled?: boolean;
  onBack: () => void;
}

export const useSwipeBackNavigation = ({
  disabled = false,
  onBack,
}: UseSwipeBackNavigationOptions) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const isTracking = useRef(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (disabled) {
      return;
    }

    document.documentElement.classList.add("overscroll-x-none", "touch-pan-y");

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        isTracking.current = false;
        return;
      }

      const touch = event.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      isTracking.current = true;
      hasNavigated.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isTracking.current || hasNavigated.current) {
        return;
      }

      const touch = event.touches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;
      const decision = decideSwipeBackGesture(deltaX, deltaY);

      if (decision.shouldCancel) {
        isTracking.current = false;
        return;
      }

      if (decision.shouldPreventDefault) {
        event.preventDefault();
      }

      if (!decision.shouldNavigateBack) {
        return;
      }

      hasNavigated.current = true;
      isTracking.current = false;
      onBack();
    };

    const handleTouchEnd = () => {
      isTracking.current = false;
      hasNavigated.current = false;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });
    document.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });

    return () => {
      document.documentElement.classList.remove(
        "overscroll-x-none",
        "touch-pan-y",
      );
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [disabled, onBack]);
};
