import { useSpring, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useCallback, useRef } from 'react';

interface SwipeNavigationConfig {
  onSwipeBack?: () => void;
  onSwipeToSidebar?: () => void;
  canSwipeBack: boolean;
  canSwipeToSidebar: boolean;
  threshold?: number;
}

export const useSwipeNavigation = ({
  onSwipeBack,
  onSwipeToSidebar,
  canSwipeBack,
  canSwipeToSidebar,
  threshold = 100,
}: SwipeNavigationConfig) => {
  const isSwipingRef = useRef(false);
  const startXRef = useRef(0);

  // メイン画面のX位置とサイドバーの表示状態
  const [{ x, sidebarX }, api] = useSpring(() => ({
    x: 0,
    sidebarX: -300, // サイドバーは初期状態では隠れている
    config: config.stiff,
  }));

  // メイン画面のドラッグハンドラー
  const mainDragBind = useDrag(
    ({ active, movement: [mx, my], velocity: [vx], last, first }) => {
      // 縦スクロールが主体の場合はスワイプをキャンセル
      if (Math.abs(my) > Math.abs(mx) && Math.abs(my) > 20) {
        return;
      }

      if (first) {
        isSwipingRef.current = true;
        startXRef.current = mx;
      }

      if (active) {
        let newX = 0;
        let newSidebarX = -300;

        // 右スワイプ（戻る操作またはサイドバー表示）
        if (mx > 0) {
          if (canSwipeBack) {
            // 戻る操作
            newX = Math.min(mx, window.innerWidth);
          } else if (canSwipeToSidebar) {
            // サイドバー表示
            const progress = Math.min(mx / 300, 1);
            newX = mx * 0.3; // メイン画面を少し右に移動
            newSidebarX = -300 + (300 * progress);
          }
        }
        // 左スワイプ（次のページまたはサイドバー隠す）
        else if (mx < 0) {
          if (canSwipeToSidebar) {
            // サイドバーを隠す方向
            newX = mx * 0.3;
            newSidebarX = Math.max(-300, -300 + mx);
          }
        }

        api.start({ x: newX, sidebarX: newSidebarX, immediate: true });
      }

      if (last) {
        isSwipingRef.current = false;
        const shouldTriggerAction = Math.abs(mx) > threshold || Math.abs(vx) > 0.5;

        if (shouldTriggerAction) {
          if (mx > 0) {
            if (canSwipeBack && mx > threshold) {
              // 戻る操作を実行
              api.start({ 
                x: window.innerWidth, 
                sidebarX: -300,
                onRest: () => {
                  onSwipeBack?.();
                  api.set({ x: 0, sidebarX: -300 });
                }
              });
              return;
            } else if (canSwipeToSidebar && mx > threshold) {
              // サイドバーを表示
              api.start({ x: 300, sidebarX: 0 });
              onSwipeToSidebar?.();
              return;
            }
          }
        }

        // アクションをトリガーしない場合は元の位置に戻る
        api.start({ x: 0, sidebarX: canSwipeToSidebar ? -300 : -300 });
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      threshold: 10,
    }
  );

  // サイドバーのドラッグハンドラー
  const sidebarDragBind = useDrag(
    ({ active, movement: [mx], velocity: [vx], last }) => {
      if (active) {
        const newSidebarX = Math.max(-300, Math.min(0, mx - 300));
        const progress = (newSidebarX + 300) / 300;
        const newX = 300 * progress;
        
        api.start({ x: newX, sidebarX: newSidebarX, immediate: true });
      }

      if (last) {
        const shouldClose = mx < -threshold || vx < -0.5;
        
        if (shouldClose) {
          api.start({ x: 0, sidebarX: -300 });
        } else {
          api.start({ x: 300, sidebarX: 0 });
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
    }
  );

  const closeSidebar = useCallback(() => {
    api.start({ x: 0, sidebarX: -300 });
  }, [api]);

  const openSidebar = useCallback(() => {
    if (canSwipeToSidebar) {
      api.start({ x: 300, sidebarX: 0 });
      onSwipeToSidebar?.();
    }
  }, [api, canSwipeToSidebar, onSwipeToSidebar]);

  return {
    mainDragBind,
    sidebarDragBind,
    springStyles: { x, sidebarX },
    closeSidebar,
    openSidebar,
    isSwipingRef,
  };
};