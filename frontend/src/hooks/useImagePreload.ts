import { useEffect, useRef } from "react";

export const useImagePreload = (imageUrls: string[]) => {
  const preloadedImages = useRef<Set<string>>(new Set());

  useEffect(() => {
    const preloadImages = () => {
      imageUrls.forEach((url) => {
        if (!preloadedImages.current.has(url)) {
          const img = new Image();
          img.src = url;
          preloadedImages.current.add(url);
        }
      });
    };

    // 少し遅らせてプリロードを実行（初期レンダリングを優先）
    const timeoutId = setTimeout(preloadImages, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [imageUrls]);
};
