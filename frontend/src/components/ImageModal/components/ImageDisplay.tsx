import React from "react";
import Image from "next/image";

interface ImageDisplayProps {
  currentImage: string;
  currentIndex: number;
}

const ImageDisplay = ({ currentImage, currentIndex }: ImageDisplayProps) => {
  return (
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
  );
};

export default ImageDisplay;
