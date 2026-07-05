import { useEffect, useRef, type RefObject } from "react";

interface UseSwipeBackNavigationOptions {
  disabled?: boolean;
  onBack: () => void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

const MIN_BACK_DISTANCE = 80;
const MAX_VERTICAL_DISTANCE = 48;
const EDGE_START_WIDTH = 32;

const isInteractiveElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      'a, button, input, textarea, select, [role="button"], [contenteditable="true"]',
    ),
  );
};

export const useSwipeBackNavigation = ({
  disabled = false,
  onBack,
  scrollContainerRef,
}: UseSwipeBackNavigationOptions) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const isTracking = useRef(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element || disabled) {
      return;
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (
        event.touches.length !== 1 ||
        isInteractiveElement(event.target) ||
        event.touches[0].clientX > EDGE_START_WIDTH
      ) {
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

      if (Math.abs(deltaY) > MAX_VERTICAL_DISTANCE) {
        isTracking.current = false;
        return;
      }

      if (deltaX < MIN_BACK_DISTANCE) {
        return;
      }

      event.preventDefault();
      hasNavigated.current = true;
      isTracking.current = false;
      onBack();
    };

    const handleTouchEnd = () => {
      isTracking.current = false;
      hasNavigated.current = false;
    };

    element.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    element.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    element.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });
    element.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [disabled, onBack, scrollContainerRef]);
};
