import React from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { ui } from "@/styles/ui";

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
          className={`${ui.button.overlayIcon} absolute left-4 top-1/2 z-[10000] -translate-y-1/2 sm:left-6`}
        >
          <IconChevronLeft size={24} />
        </button>
      )}

      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className={`${ui.button.overlayIcon} absolute right-4 top-1/2 z-[10000] -translate-y-1/2 sm:right-6`}
        >
          <IconChevronRight size={24} />
        </button>
      )}
    </>
  );
};

export default NavigationButtons;
