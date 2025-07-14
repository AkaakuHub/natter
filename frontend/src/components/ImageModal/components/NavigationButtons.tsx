import React from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface NavigationButtonsProps {
  hasMultiple: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

const NavigationButtons = ({
  hasMultiple,
  onPrevious,
  onNext,
}: NavigationButtonsProps) => {
  if (!hasMultiple) return null;

  return (
    <>
      {onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-[101] text-text-inverse hover:text-text-inverse/80 bg-overlay hover:bg-overlay/90 rounded-full p-3 transition-all duration-200"
        >
          <IconChevronLeft size={28} />
        </button>
      )}

      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-[101] text-text-inverse hover:text-text-inverse/80 bg-overlay hover:bg-overlay/90 rounded-full p-3 transition-all duration-200"
        >
          <IconChevronRight size={28} />
        </button>
      )}
    </>
  );
};

export default NavigationButtons;
