import { useEffect, useRef } from "react";

export const useScrollContainer = () => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // BaseLayoutのscrollContainerを探す
    const findScrollContainer = () => {
      // flex-1とoverflow-y-autoクラスを持つ要素を探す
      const scrollElement = document.querySelector(
        ".flex-1.overflow-y-auto",
      ) as HTMLDivElement;
      if (scrollElement) {
        scrollContainerRef.current = scrollElement;
        console.log("Found scroll container:", scrollElement);
      } else {
        console.log("Scroll container not found");
      }
    };

    // DOMが読み込まれた後に実行
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", findScrollContainer);
    } else {
      findScrollContainer();
    }

    // 少し遅延して再試行（レイアウトの構築を待つ）
    const timeoutId = setTimeout(findScrollContainer, 100);

    return () => {
      document.removeEventListener("DOMContentLoaded", findScrollContainer);
      clearTimeout(timeoutId);
    };
  }, []);

  return scrollContainerRef;
};
