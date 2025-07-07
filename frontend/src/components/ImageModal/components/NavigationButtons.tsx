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
          onClick={onPrevious}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-full p-4 transition-colors duration-200 shadow-lg"
        >
          <IconChevronLeft size={24} />
        </button>
      )}

      {onNext && (
        <button
          onClick={onNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-full p-4 transition-colors duration-200 shadow-lg"
        >
          <IconChevronRight size={24} />
        </button>
      )}
    </>
  );
};

export default NavigationButtons;
