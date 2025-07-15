"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useModalState } from "@/hooks/useModalState";

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
  useScrollLock(isOpen);
  useModalState("image-modal", isOpen);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
      }}
    >
      <div
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* 画像表示 */}
        <ImageDisplay currentImage={currentImage} currentIndex={currentIndex} />

        {/* バツボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[10000] text-text-inverse hover:text-text-inverse/80 bg-overlay hover:bg-overlay/90 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
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

  // body直下にポータルでレンダリング
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default ImageModal;
