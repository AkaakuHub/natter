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
      className="max-w-[90vw] max-h-[90vh] min-w-[400px] min-h-[300px] object-contain cursor-default"
      style={{
        maxWidth: "90vw",
        maxHeight: "90vh",
        minWidth: "400px",
        minHeight: "300px",
        width: "auto",
        height: "auto",
      }}
      onClick={handleImageClick}
      loading="eager"
      decoding="async"
    />
  );
};

export default ImageDisplay;
