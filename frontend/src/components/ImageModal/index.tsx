"use client";

import React from "react";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

import ModalHeader from "./components/ModalHeader";
import ImageDisplay from "./components/ImageDisplay";
import NavigationButtons from "./components/NavigationButtons";
import ThumbnailNavigation from "./components/ThumbnailNavigation";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] mx-4 flex items-center justify-center">
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-visible border border-gray-100 w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
          <ModalHeader
            hasMultiple={hasMultiple}
            currentIndex={currentIndex}
            totalImages={images.length}
            onClose={onClose}
          />

          <ImageDisplay
            currentImage={currentImage}
            currentIndex={currentIndex}
          />

          <NavigationButtons
            hasMultiple={hasMultiple}
            onPrevious={onPrevious}
            onNext={onNext}
          />

          <ThumbnailNavigation
            hasMultiple={hasMultiple}
            images={images}
            currentIndex={currentIndex}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
