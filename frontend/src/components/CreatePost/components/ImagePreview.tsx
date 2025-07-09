import React from "react";
import Image from "next/image";
import { IconX } from "@tabler/icons-react";
import { useImagePreload } from "@/hooks/useImagePreload";

interface ImagePreviewProps {
  imageUrls: string[];
  onRemove: (index: number) => void;
}

const ImagePreview = ({ imageUrls, onRemove }: ImagePreviewProps) => {
  // 画像をプリロード
  useImagePreload(imageUrls);

  if (imageUrls.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {imageUrls.map((imageUrl, index) => (
        <div key={index} className="relative">
          <Image
            src={imageUrl}
            alt={`添付画像 ${index + 1}`}
            className="w-full h-32 object-cover rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300"
            width={200}
            height={128}
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 bg-error/90 backdrop-blur-sm text-text-inverse rounded-full p-2 hover:bg-error-hover transition-all duration-300 hover:scale-110"
          >
            <IconX size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;
