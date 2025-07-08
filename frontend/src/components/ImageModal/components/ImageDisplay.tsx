import React from "react";
import Image from "next/image";

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
    <Image
      src={currentImage}
      alt={`画像 ${currentIndex + 1}`}
      width={1200}
      height={800}
      className="max-w-[90vw] max-h-[90vh] min-w-[400px] min-h-[300px] object-contain cursor-default"
      style={{
        maxWidth: "90vw",
        maxHeight: "90vh",
        minWidth: "400px",
        minHeight: "300px",
        width: "auto",
        height: "auto",
      }}
      quality={100}
      priority
      onClick={handleImageClick}
    />
  );
};

export default ImageDisplay;
