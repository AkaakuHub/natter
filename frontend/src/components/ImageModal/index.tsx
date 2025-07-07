"use client";

import React from "react";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

import ImageDisplay from "./components/ImageDisplay";
import NavigationButtons from "./components/NavigationButtons";

interface ImageModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const ImageModal = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
}: ImageModalProps) => {
  useKeyboardNavigation({ isOpen, onClose, onPrevious, onNext });

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 画像表示 */}
        <div onClick={(e) => e.stopPropagation()}>
          <ImageDisplay
            currentImage={currentImage}
            currentIndex={currentIndex}
          />
        </div>

        {/* バツボタン */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-30 text-text-inverse hover:text-text-inverse/80 bg-overlay hover:bg-overlay/90 rounded-full p-3 transition-all duration-200"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* ナビゲーションボタン（複数画像の場合のみ） */}
        {hasMultiple && (
          <NavigationButtons
            hasMultiple={hasMultiple}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        )}
      </div>
    </div>
  );
};

export default ImageModal;
