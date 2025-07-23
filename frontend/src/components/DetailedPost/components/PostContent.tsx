import React from "react";
import { IconUser } from "@tabler/icons-react";
import { getImageUrl } from "@/utils/postUtils";
import { decodeHtmlEntities, breakLongWords } from "@/utils/htmlUtils";
import { getCharacterColorStyle } from "@/utils/characterColorUtils";
import { Character } from "@/api";
import { useImagePreload } from "@/hooks/useImagePreload";
import AuthenticatedImage from "@/components/common/AuthenticatedImage";
import RichText from "@/components/common/RichText";

interface PostContentProps {
  content: string;
  images?: string[];
  url?: string;
  character?: Character;
  onImageClick: (index: number) => void;
}

const PostContent = ({
  content,
  images,
  url,
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

  // URLもHTMLエスケープされている場合があるのでデコード
  const processedUrl = React.useMemo(() => {
    if (!url || url === "???") return url;
    return decodeHtmlEntities(url);
  }, [url]);

  return (
    <div className="p-6">
      {/* キャラクター表示 */}
      {character && (
        <div
          className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg border"
          style={getCharacterColorStyle(character.name, 0.5)}
        >
          <IconUser size={16} className="text-text" />
          <span className="text-sm font-medium text-text break-words word-break-break-all whitespace-normal min-w-0 flex-1">
            {character.name}
          </span>
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <div className="text-text text-lg leading-relaxed whitespace-pre-wrap font-medium break-words selectable-text break-long-words cursor-text">
          <RichText
            className="whitespace-pre-wrap"
            showUrlPreviews={true}
            onTextSelect={(e) => {
              // テキスト選択のイベント処理
              const selection = window.getSelection();
              if (selection && selection.toString().length > 0) {
                e.stopPropagation();
              }
            }}
          >
            {processedContent}
          </RichText>
        </div>
      </div>

      {/* URL表示 */}
      {processedUrl && processedUrl !== "???" && (
        <div className="mt-4 p-4 bg-surface-variant rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">URL:</span>
            <a
              href={processedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-interactive hover:text-interactive-hover underline break-all overflow-wrap-anywhere"
              onClick={(e) => e.stopPropagation()}
            >
              {processedUrl}
            </a>
          </div>
        </div>
      )}

      {/* URL隠蔽表示 */}
      {processedUrl === "???" && (
        <div className="mt-4 p-4 bg-surface-variant rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">URL:</span>
            <span className="text-sm text-text-muted">???</span>
          </div>
        </div>
      )}

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
                <AuthenticatedImage
                  src={imageSrc}
                  alt={`Post image ${idx + 1}`}
                  width={512}
                  height={512}
                  className="w-full h-auto object-cover cursor-pointer rounded-3xl"
                  loading="lazy"
                  decoding="async"
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
