import { RefObject, useEffect, useRef } from "react";
import { imageFilesFromClipboardItems } from "@/hooks/clipboardImages";

interface ClipboardImagePasteOptions {
  enabled: boolean;
  onPasteImages: (files: File[]) => void | Promise<void>;
  containerRef?: RefObject<HTMLElement | null>;
}

export const useClipboardImagePaste = ({
  enabled,
  onPasteImages,
  containerRef,
}: ClipboardImagePasteOptions) => {
  const lastEventTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (
        !event.clipboardData ||
        event.defaultPrevented ||
        lastEventTimestampRef.current === event.timeStamp
      ) {
        return;
      }

      if (containerRef?.current) {
        const targetNode = event.target as Node | null;
        if (!targetNode || !containerRef.current.contains(targetNode)) {
          return;
        }
      }

      const files = imageFilesFromClipboardItems(event.clipboardData.items);

      if (files.length === 0) {
        return;
      }

      lastEventTimestampRef.current = event.timeStamp;
      event.preventDefault();
      event.stopPropagation();
      void onPasteImages(files);
    };

    window.addEventListener("paste", handlePaste, { capture: true });

    return () => {
      window.removeEventListener("paste", handlePaste, { capture: true });
      lastEventTimestampRef.current = null;
    };
  }, [enabled, onPasteImages, containerRef]);
};

export default useClipboardImagePaste;
