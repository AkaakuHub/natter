import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/utils/postUtils";
import { decodeHtmlEntities, breakLongWords } from "@/utils/htmlUtils";

interface PostContentProps {
  content: string;
  images?: string[];
  onImageClick: (index: number) => void;
}

const PostContent = ({ content, images, onImageClick }: PostContentProps) => {
  // imagesが配列でない場合のチェック
  const imageArray = Array.isArray(images) ? images : [];

  // HTMLエスケープされたコンテンツを復元し、長い単語を改行可能にする
  const processedContent = React.useMemo(() => {
    const decoded = decodeHtmlEntities(content);
    return breakLongWords(decoded);
  }, [content]);

  return (
    <>
      <div className="prose prose-lg max-w-none">
        <p
          className="text-text leading-relaxed text-lg whitespace-pre-wrap mb-4 break-words selectable-text break-long-words"
          style={{ userSelect: "text" }}
          onMouseDown={(e) => {
            // テキスト選択を開始する場合は親のクリックイベントを無効化
            e.stopPropagation();
          }}
          onMouseUp={(e) => {
            // テキストが選択されている場合は親のクリックイベントを無効化
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
              e.stopPropagation();
            }
          }}
          onClick={(e) => {
            // テキストが選択されている場合は親のクリックイベントを無効化
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
              e.stopPropagation();
            }
          }}
        >
          {processedContent}
        </p>
      </div>
      {imageArray && imageArray.length > 0 && (
        <div
          className={`mt-4 gap-3 ${
            imageArray.length === 1
              ? "flex justify-center"
              : imageArray.length === 2
                ? "grid grid-cols-2"
                : imageArray.length === 3
                  ? "grid grid-cols-2 grid-rows-2"
                  : "grid grid-cols-2"
          }`}
        >
          {imageArray.map((image, index) => {
            const imageSrc = getImageUrl(image);

            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick(index);
                }}
                className={`relative focus:outline-none focus:ring-2 focus:ring-interactive/30 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 ${
                  imageArray.length === 1
                    ? "max-w-lg mx-auto"
                    : imageArray.length === 3 && index === 0
                      ? "row-span-2"
                      : ""
                }`}
              >
                <Image
                  src={imageSrc}
                  alt="Post Image"
                  className={`rounded-2xl ${
                    imageArray.length === 1
                      ? "w-full h-auto max-h-96 object-cover"
                      : imageArray.length === 3 && index === 0
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
