import React from "react";
import Image from "next/image";
import { IconUser } from "@tabler/icons-react";
import { getImageUrl } from "@/utils/postUtils";
import { decodeHtmlEntities, breakLongWords } from "@/utils/htmlUtils";
import { Character } from "@/api";
import { useImagePreload } from "@/hooks/useImagePreload";

interface PostContentProps {
  content: string;
  images?: string[];
  character?: Character;
  onImageClick: (index: number) => void;
}

const PostContent = ({
  content,
  images,
  character,
  onImageClick,
}: PostContentProps) => {
  // 画像URLの配列を作成してプリロード
  const imageUrls = React.useMemo(() => {
    return images ? images.map((image) => getImageUrl(image)) : [];
  }, [images]);

  // 画像をプリロード
  useImagePreload(imageUrls);

  // HTMLエスケープされたコンテンツを復元し、長い単語を改行可能にする
  const processedContent = React.useMemo(() => {
    const decoded = decodeHtmlEntities(content);
    return breakLongWords(decoded);
  }, [content]);

  return (
    <div className="p-6">
      {/* キャラクター表示 */}
      {character && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <IconUser size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {character.name}
          </span>
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <p className="text-text text-lg leading-relaxed whitespace-pre-wrap font-medium break-words selectable-text break-long-words cursor-text">
          {processedContent}
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
                className="relative overflow-hidden rounded-3xl focus:outline-none focus:ring-2 focus:ring-interactive/50 focus:ring-offset-2 shadow-soft hover:shadow-glow"
              >
                <Image
                  src={imageSrc}
                  alt={`Post image ${idx + 1}`}
                  width={512}
                  height={512}
                  className="w-full h-auto min-h-[250px] min-w-[250px] object-cover cursor-pointer rounded-3xl"
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
