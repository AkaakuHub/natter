import { RefObject, useEffect, useRef } from "react";

interface ClipboardImagePasteOptions {
  enabled: boolean;
  onPasteImages: (files: File[]) => void;
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

      const files = Array.from(event.clipboardData.items)
        .map((item) => {
          if (item.kind !== "file" || !item.type.startsWith("image/")) {
            return null;
          }
          return item.getAsFile();
        })
        .filter((file): file is File => file !== null);

      if (files.length === 0) {
        return;
      }

      lastEventTimestampRef.current = event.timeStamp;
      event.preventDefault();
      event.stopPropagation();
      onPasteImages(files);
    };

    window.addEventListener("paste", handlePaste, { capture: true });

    return () => {
      window.removeEventListener("paste", handlePaste, { capture: true });
      lastEventTimestampRef.current = null;
    };
  }, [enabled, onPasteImages, containerRef]);
};

export default useClipboardImagePaste;
