import React from "react";
import Image from "next/image";

interface ImageDisplayProps {
  currentImage: string;
  currentIndex: number;
}

const ImageDisplay = ({ currentImage, currentIndex }: ImageDisplayProps) => {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <Image
        src={currentImage}
        alt={`画像 ${currentIndex + 1}`}
        width={1200}
        height={800}
        className="max-w-[90vw] max-h-[90vh] object-contain"
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          width: "auto",
          height: "auto",
        }}
        quality={100}
        priority
      />
    </div>
  );
};

export default ImageDisplay;
