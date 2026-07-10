export interface SwipeBackGestureDecision {
  shouldCancel: boolean;
  shouldNavigateBack: boolean;
  shouldPreventDefault: boolean;
}

const DIRECTION_LOCK_DISTANCE = 8;
const NAVIGATION_DISTANCE = 64;

export const decideSwipeBackGesture = (
  deltaX: number,
  deltaY: number,
): SwipeBackGestureDecision => {
  const absoluteDeltaX = Math.abs(deltaX);
  const absoluteDeltaY = Math.abs(deltaY);
  const hasDirection =
    absoluteDeltaX >= DIRECTION_LOCK_DISTANCE ||
    absoluteDeltaY >= DIRECTION_LOCK_DISTANCE;
  const isRightSwipe = deltaX > 0 && deltaX > absoluteDeltaY;

  if (hasDirection && !isRightSwipe) {
    return {
      shouldCancel: true,
      shouldNavigateBack: false,
      shouldPreventDefault: false,
    };
  }

  return {
    shouldCancel: false,
    shouldNavigateBack: deltaX >= NAVIGATION_DISTANCE,
    shouldPreventDefault: hasDirection && isRightSwipe,
  };
};
