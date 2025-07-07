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
    <>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap mb-4">
          {content}
        </p>
      </div>
      {images && images.length > 0 && (
        <div
          className={`mt-4 gap-3 ${
            images.length === 1
              ? "flex justify-center"
              : images.length === 2
                ? "grid grid-cols-2"
                : images.length === 3
                  ? "grid grid-cols-2 grid-rows-2"
                  : "grid grid-cols-2"
          }`}
        >
          {images.map((image, index) => {
            const imageSrc = getImageUrl(image);

            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick(index);
                }}
                className={`relative focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 ${
                  images.length === 1
                    ? "max-w-lg mx-auto"
                    : images.length === 3 && index === 0
                      ? "row-span-2"
                      : ""
                }`}
              >
                <Image
                  src={imageSrc}
                  alt="Post Image"
                  className={`rounded-2xl ${
                    images.length === 1
                      ? "w-full h-auto max-h-96 object-cover"
                      : images.length === 3 && index === 0
                        ? "w-full h-full object-cover"
                        : "w-full h-auto aspect-square object-cover"
                  }`}
                  width={200}
                  height={200}
                />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

export default PostContent;