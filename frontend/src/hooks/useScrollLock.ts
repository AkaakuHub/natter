import { useEffect, useRef } from "react";
import {
  primaryScrollContainerSelector,
  scrollLockedClassName,
} from "@/components/layout/scrollLayout";

export const useScrollLock = (isLocked: boolean) => {
  const scrollPosition = useRef<number>(0);
  const scrollContainer = useRef<HTMLElement | null>(null);
  const wasLocked = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    scrollContainer.current = document.querySelector(
      primaryScrollContainerSelector,
    ) as HTMLElement;

    if (isLocked && !wasLocked.current && scrollContainer.current) {
      // 現在のスクロール位置を保存
      scrollPosition.current = scrollContainer.current.scrollTop;

      // スクロールコンテナのスクロールを無効化
      scrollContainer.current.classList.add(scrollLockedClassName);

      // bodyも念のためオーバーフローを無効化（position:fixedは使わない）
      document.body.classList.add(scrollLockedClassName);

      wasLocked.current = true;
    } else if (!isLocked && wasLocked.current && scrollContainer.current) {
      // スクロールを復元
      scrollContainer.current.classList.remove(scrollLockedClassName);
      document.body.classList.remove(scrollLockedClassName);

      // 次のフレームでスクロール位置を復元
      requestAnimationFrame(() => {
        if (scrollContainer.current) {
          scrollContainer.current.scrollTop = scrollPosition.current;
          // 確認のため再度実行
          setTimeout(() => {
            if (scrollContainer.current) {
              if (
                scrollContainer.current.scrollTop !== scrollPosition.current
              ) {
                scrollContainer.current.scrollTop = scrollPosition.current;
              }
            }
          }, 50);
        }
      });

      wasLocked.current = false;
    }
  }, [isLocked]);

  // コンポーネントのアンマウント時にもスクロールを復元
  useEffect(() => {
    return () => {
      if (wasLocked.current) {
        if (scrollContainer.current) {
          scrollContainer.current.classList.remove(scrollLockedClassName);
          scrollContainer.current.scrollTop = scrollPosition.current;
        }
        document.body.classList.remove(scrollLockedClassName);
        wasLocked.current = false;
      }
    };
  }, []);
};
