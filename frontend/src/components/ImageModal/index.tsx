"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

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
  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && onPrevious) {
        onPrevious();
      } else if (e.key === "ArrowRight" && onNext) {
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onPrevious, onNext]);

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
      {/* モーダルコンテンツ */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] mx-4 flex items-center justify-center">
        {/* 美しい画像フレーム */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-visible border border-gray-100 w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* ヘッダー */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-white p-6">
            <div className="flex items-center justify-between">
              {hasMultiple && (
                <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
              <div className="flex-1"></div>
              <button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full p-3 transition-colors duration-200"
              >
                <IconX size={20} />
              </button>
            </div>
          </div>

          {/* 画像エリア */}
          <div className="relative flex-1 flex items-center justify-center bg-gray-50 p-8 mt-20">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={currentImage}
                alt={`画像 ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
                style={{ maxHeight: "calc(70vh - 10rem)" }}
                quality={100}
                priority
              />
            </div>
          </div>

          {/* ナビゲーションボタン */}
          {hasMultiple && onPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-full p-4 transition-colors duration-200 shadow-lg"
            >
              <IconChevronLeft size={24} />
            </button>
          )}

          {hasMultiple && onNext && (
            <button
              onClick={onNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-full p-4 transition-colors duration-200 shadow-lg"
            >
              <IconChevronRight size={24} />
            </button>
          )}

          {/* サムネイルナビゲーション（複数画像の場合） */}
          {hasMultiple && (
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-white p-6">
              <div className="flex items-center justify-center space-x-3 max-w-full overflow-x-auto pb-2">
                {images.slice(0, 8).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
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
                    }}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                      index === currentIndex
                        ? "border-blue-500 ring-2 ring-blue-200 scale-110"
                        : "border-gray-200 hover:border-gray-300 hover:scale-105"
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
                      <div className="absolute inset-0 bg-blue-500/20"></div>
                    )}
                  </button>
                ))}
                {images.length > 8 && (
                  <div className="text-gray-500 text-sm px-2">
                    +{images.length - 8}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
