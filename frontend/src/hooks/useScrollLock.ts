import { useEffect, useRef } from "react";

export const useScrollLock = (isLocked: boolean) => {
  const scrollPosition = useRef<number>(0);
  const scrollContainer = useRef<HTMLElement | null>(null);
  const wasLocked = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 実際のスクロールコンテナを取得
    scrollContainer.current = document.querySelector(
      ".flex-1.overflow-y-auto",
    ) as HTMLElement;

    if (isLocked && !wasLocked.current && scrollContainer.current) {
      // 現在のスクロール位置を保存
      scrollPosition.current = scrollContainer.current.scrollTop;

      // スクロールコンテナのスクロールを無効化
      scrollContainer.current.classList.add("scroll-locked");

      // bodyも念のためオーバーフローを無効化（position:fixedは使わない）
      document.body.classList.add("scroll-locked");

      wasLocked.current = true;
    } else if (!isLocked && wasLocked.current && scrollContainer.current) {
      // スクロールを復元
      scrollContainer.current.classList.remove("scroll-locked");
      document.body.classList.remove("scroll-locked");

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
          scrollContainer.current.classList.remove("scroll-locked");
          scrollContainer.current.scrollTop = scrollPosition.current;
        }
        document.body.classList.remove("scroll-locked");
        wasLocked.current = false;
      }
    };
  }, []);
};
