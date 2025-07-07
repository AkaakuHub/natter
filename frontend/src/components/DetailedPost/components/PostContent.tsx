import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/utils/postUtils";

interface PostContentProps {
  content: string;
  images?: string[];
  onImageClick: (index: number) => void;
}

const PostContent = ({ content, images, onImageClick }: PostContentProps) => {
  return (
    <div className="p-6">
      <div className="prose prose-lg max-w-none">
        <p className="text-text text-lg leading-relaxed whitespace-pre-wrap font-medium">
          {content}
        </p>
      </div>

      {/* Images */}
      {images && images.length > 0 && (
        <div
          className={`mt-6 ${
            images.length === 1
              ? "flex justify-center"
              : "grid grid-cols-2 gap-4"
          }`}
        >
          {images.map((image, idx) => {
            const imageSrc = getImageUrl(image);

            return (
              <button
                key={idx}
                onClick={() => onImageClick(idx)}
                className="relative group overflow-hidden rounded-3xl focus:outline-none focus:ring-2 focus:ring-interactive/50 focus:ring-offset-2 shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-[1.02]"
              >
                <Image
                  src={imageSrc}
                  alt={`Post image ${idx + 1}`}
                  width={512}
                  height={512}
                  className="w-full h-auto object-cover transition-all duration-300 group-hover:scale-105 cursor-pointer rounded-3xl"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostContent;
