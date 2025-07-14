import { useEffect, useRef } from "react";

export const useScrollLock = (isLocked: boolean) => {
  const scrollPosition = useRef<number>(0);
  const bodyElement = useRef<HTMLElement | null>(null);
  const wasLocked = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    bodyElement.current = document.body;

    if (isLocked && !wasLocked.current) {
      // 現在のスクロール位置を保存
      scrollPosition.current =
        window.pageYOffset || document.documentElement.scrollTop;
      console.log("Saving scroll position:", scrollPosition.current);

      // bodyのスクロールを無効化
      bodyElement.current.style.position = "fixed";
      bodyElement.current.style.top = `-${scrollPosition.current}px`;
      bodyElement.current.style.width = "100%";
      bodyElement.current.style.overflow = "hidden";

      wasLocked.current = true;
    } else if (!isLocked && wasLocked.current) {
      // スクロールを復元
      if (bodyElement.current) {
        bodyElement.current.style.position = "";
        bodyElement.current.style.top = "";
        bodyElement.current.style.width = "";
        bodyElement.current.style.overflow = "";

        console.log("Restoring scroll position:", scrollPosition.current);

        // 次のフレームでスクロール位置を復元（DOMの更新を待つ）
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosition.current);
          // 確認のため再度実行
          setTimeout(() => {
            console.log("Final scroll position check:", window.pageYOffset);
            if (window.pageYOffset !== scrollPosition.current) {
              console.log("Scroll position mismatch, retrying...");
              window.scrollTo(0, scrollPosition.current);
            }
          }, 50);
        });
      }

      wasLocked.current = false;
    }
  }, [isLocked]);

  // コンポーネントのアンマウント時にもスクロールを復元
  useEffect(() => {
    return () => {
      if (wasLocked.current && bodyElement.current) {
        bodyElement.current.style.position = "";
        bodyElement.current.style.top = "";
        bodyElement.current.style.width = "";
        bodyElement.current.style.overflow = "";

        // スクロール位置を復元
        if (scrollPosition.current > 0) {
          window.scrollTo(0, scrollPosition.current);
        }

        wasLocked.current = false;
      }
    };
  }, []);
};
