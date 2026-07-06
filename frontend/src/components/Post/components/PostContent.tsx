import React from "react";
import { IconUser } from "@tabler/icons-react";
import { getImageUrl } from "@/utils/postUtils";
import { decodeHtmlEntities, breakLongWords } from "@/utils/htmlUtils";
import { getCharacterColorStyle } from "@/utils/characterColorUtils";
import { Character } from "@/api";
import { useImagePreload } from "@/hooks/useImagePreload";
import AuthenticatedImage from "@/components/common/AuthenticatedImage";
import RichText from "@/components/common/RichText";
import { ui } from "@/styles/ui";

interface PostContentProps {
  content: string;
  images?: string[];
  url?: string;
  character?: Character;
  fetchImagesWithAuth: boolean;
  onImageClick: (index: number) => void;
}

const PostContent = ({
  content,
  images,
  url,
  character,
  fetchImagesWithAuth,
  onImageClick,
}: PostContentProps) => {
  const imageArray = React.useMemo(() => {
    return Array.isArray(images) ? images : [];
  }, [images]);

  const imageUrls = React.useMemo(() => {
    return imageArray.map((image) => getImageUrl(image));
  }, [imageArray]);

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
    <>
      {/* キャラクター表示 */}
      {character && (
        <div
          className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg border"
          style={getCharacterColorStyle(character.name, 0.5)}
        >
          <IconUser size={16} className="text-text" />
          <span className="text-sm font-medium text-text break-words word-break-break-all whitespace-normal min-w-0 flex-1">
            {character.name}
          </span>
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <div className="text-text leading-relaxed text-lg whitespace-pre-wrap mb-4 break-words selectable-text break-long-words cursor-text">
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
        <div className="mt-3 p-3 bg-surface-variant rounded-lg border border-border">
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
        <div className="mt-3 p-3 bg-surface-variant rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">URL:</span>
            <span className="text-sm text-text-muted">???</span>
          </div>
        </div>
      )}

      {imageArray.length > 0 && (
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
          {imageUrls.map((imageSrc, index) => {
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick(index);
                }}
                className={`relative focus:outline-none focus:ring-2 focus:ring-border-focus ${ui.surface.media} ${
                  imageArray.length === 1
                    ? "max-w-lg mx-auto"
                    : imageArray.length === 3 && index === 0
                      ? "row-span-2"
                      : ""
                }`}
              >
                <AuthenticatedImage
                  src={imageSrc}
                  alt="Post Image"
                  className={`${
                    imageArray.length === 1
                      ? "w-full h-auto max-h-96 object-cover"
                      : imageArray.length === 3 && index === 0
                        ? "w-full h-full object-cover"
                        : "w-full h-auto aspect-square object-cover"
                  }`}
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  fetchWithAuth={fetchImagesWithAuth}
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
