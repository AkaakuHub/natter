import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // サーバーサイドでは false を返す
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(query);

    // 初期値を設定
    setMatches(media.matches);

    // イベントリスナーを設定
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 新しいAPIがサポートされている場合
    if (media.addEventListener) {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } else {
      // 古いAPIのフォールバック
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
}
