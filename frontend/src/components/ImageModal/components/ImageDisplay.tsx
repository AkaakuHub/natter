import React from "react";
import AuthenticatedImage from "@/components/common/AuthenticatedImage";

interface ImageDisplayProps {
  currentImage: string;
  currentIndex: number;
}

const ImageDisplay = ({ currentImage, currentIndex }: ImageDisplayProps) => {
  const handleImageClick = (e: React.MouseEvent) => {
    // 画像要素自体のクリックは無効化
    e.stopPropagation();
  };

  return (
    <AuthenticatedImage
      src={currentImage}
      alt={`画像 ${currentIndex + 1}`}
      className="max-w-[calc(100vw-4rem)] max-h-[calc(100vh-4rem)] w-auto h-auto object-contain cursor-default"
      style={{
        maxWidth: "calc(100vw - 4rem)",
        maxHeight: "calc(100vh - 4rem)",
        width: "auto",
        height: "auto",
        display: "block",
      }}
      onClick={handleImageClick}
      loading="eager"
      decoding="async"
    />
  );
};

export default ImageDisplay;
