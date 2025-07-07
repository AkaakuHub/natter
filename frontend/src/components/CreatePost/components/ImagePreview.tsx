import React from "react";
import Image from "next/image";
import { IconX } from "@tabler/icons-react";

interface ImagePreviewProps {
  imageUrls: string[];
  onRemove: (index: number) => void;
}

const ImagePreview = ({ imageUrls, onRemove }: ImagePreviewProps) => {
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
            className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300 hover:scale-110"
          >
            <IconX size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;
