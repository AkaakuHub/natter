import React from "react";
import Image from "next/image";

interface ThumbnailNavigationProps {
  hasMultiple: boolean;
  images: string[];
  currentIndex: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

const ThumbnailNavigation = ({
  hasMultiple,
  images,
  currentIndex,
  onPrevious,
  onNext,
}: ThumbnailNavigationProps) => {
  if (!hasMultiple) return null;

  const handleThumbnailClick = (index: number) => {
    if (index < currentIndex && onPrevious) {
      const diff = currentIndex - index;
      for (let i = 0; i < diff; i++) {
        setTimeout(() => onPrevious(), i * 50);
      }
    } else if (index > currentIndex && onNext) {
      const diff = index - currentIndex;
      for (let i = 0; i < diff; i++) {
        setTimeout(() => onNext(), i * 50);
      }
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-surface p-6">
      <div className="flex items-center justify-center space-x-3 max-w-full overflow-x-auto pb-2">
        {images.slice(0, 8).map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
              index === currentIndex
                ? "border-interactive ring-2 ring-interactive-bg scale-110"
                : "border-border hover:border-border-muted hover:scale-105"
            }`}
          >
            <Image
              src={image}
              alt={`サムネイル ${index + 1}`}
              fill
              className="object-cover"
              sizes="64px"
            />
            {index === currentIndex && (
              <div className="absolute inset-0 bg-interactive/20"></div>
            )}
          </button>
        ))}
        {images.length > 8 && (
          <div className="text-text-muted text-sm px-2">
            +{images.length - 8}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailNavigation;
