import { useEffect, useRef } from "react";

interface UseClickOutsideResult<T extends HTMLElement> {
  ref: React.RefObject<T>;
}

export const useClickOutside = <T extends HTMLElement>(
  onClickOutside: () => void,
): UseClickOutsideResult<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClickOutside]);

  return { ref };
};