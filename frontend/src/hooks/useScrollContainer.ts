import { useEffect, useRef } from "react";
import { primaryScrollContainerSelector } from "@/components/layout/scrollLayout";

export const useScrollContainer = () => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const findScrollContainer = () => {
      const scrollElement = document.querySelector(
        primaryScrollContainerSelector,
      ) as HTMLDivElement;
      if (scrollElement) {
        scrollContainerRef.current = scrollElement;
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", findScrollContainer);
    } else {
      findScrollContainer();
    }

    const timeoutId = setTimeout(findScrollContainer, 100);

    return () => {
      document.removeEventListener("DOMContentLoaded", findScrollContainer);
      clearTimeout(timeoutId);
    };
  }, []);

  return scrollContainerRef;
};
