import { useEffect, useRef } from "react";
import { useAppState } from "@/contexts/AppStateContext";

export const useInputFocus = () => {
  const { setInputFocused } = useAppState();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    const handleFocus = () => setInputFocused(true);
    const handleBlur = () => setInputFocused(false);

    element.addEventListener("focus", handleFocus);
    element.addEventListener("blur", handleBlur);

    return () => {
      element.removeEventListener("focus", handleFocus);
      element.removeEventListener("blur", handleBlur);
    };
  }, [setInputFocused]);

  return inputRef;
};
