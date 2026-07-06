"use client";

import React from "react";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useModalState } from "@/hooks/useModalState";
import { ui } from "@/styles/ui";

import ImageDisplay from "./components/ImageDisplay";
import NavigationButtons from "./components/NavigationButtons";

interface ImageModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  fetchImagesWithAuth?: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const ImageModal = ({
  isOpen,
  images,
  currentIndex,
  fetchImagesWithAuth = true,
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
        <ImageDisplay
          currentImage={currentImage}
          currentIndex={currentIndex}
          fetchWithAuth={fetchImagesWithAuth}
        />

        {/* バツボタン */}
        <button
          onClick={onClose}
          className={`${ui.button.overlayIcon} absolute top-4 right-4 z-[10000] sm:top-6 sm:right-6`}
        >
          <IconX size={24} />
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
