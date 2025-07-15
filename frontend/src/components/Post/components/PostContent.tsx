import React from "react";
import { IconUser } from "@tabler/icons-react";
import { getImageUrl } from "@/utils/postUtils";
import { decodeHtmlEntities, breakLongWords } from "@/utils/htmlUtils";
import { getCharacterColorStyle } from "@/utils/characterColorUtils";
import { Character } from "@/api";
import { useImagePreload } from "@/hooks/useImagePreload";
import AuthenticatedImage from "@/components/common/AuthenticatedImage";

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
  // imagesが配列でない場合のチェック
  const imageArray = React.useMemo(() => {
    return Array.isArray(images) ? images : [];
  }, [images]);

  // 隠蔽された画像をフィルタリング
  const visibleImages = React.useMemo(() => {
    return imageArray.filter((image) => image !== "HIDDEN_IMAGE");
  }, [imageArray]);

  // 隠蔽された画像の数
  const hiddenImageCount = React.useMemo(() => {
    return imageArray.filter((image) => image === "HIDDEN_IMAGE").length;
  }, [imageArray]);

  // 画像URLの配列を作成してプリロード
  const imageUrls = React.useMemo(() => {
    return visibleImages.map((image) => getImageUrl(image));
  }, [visibleImages]);

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
    <>
      {/* キャラクター表示 */}
      {character && (
        <div
          className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg border"
          style={getCharacterColorStyle(character.name, 0.5)}
        >
          <IconUser size={16} className="text-text" />
          <span className="text-sm font-medium text-text">
            {character.name}
          </span>
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <p
          className="text-text leading-relaxed text-lg whitespace-pre-wrap mb-4 break-words selectable-text break-long-words cursor-text"
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

      {/* URL表示 */}
      {processedUrl && processedUrl !== "???" && (
        <div className="mt-3 p-3 bg-surface-variant rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">URL:</span>
            <a
              href={processedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-interactive hover:text-interactive-hover underline break-all"
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

      {/* 隠蔽された画像の通知 */}
      {hiddenImageCount > 0 && (
        <div className="mt-3 p-3 bg-surface-variant rounded-lg border border-border">
          <div className="flex items-center gap-2 text-text-muted">
            <span className="text-sm">
              🔒 {hiddenImageCount}枚の画像が非公開に設定されています
            </span>
          </div>
        </div>
      )}

      {visibleImages && visibleImages.length > 0 && (
        <div
          className={`mt-4 gap-3 ${
            visibleImages.length === 1
              ? "flex justify-center"
              : visibleImages.length === 2
                ? "grid grid-cols-2"
                : visibleImages.length === 3
                  ? "grid grid-cols-2 grid-rows-2"
                  : "grid grid-cols-2"
          }`}
        >
          {visibleImages.map((image, index) => {
            const imageSrc = getImageUrl(image);

            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick(index);
                }}
                className={`relative focus:outline-none focus:ring-2 focus:ring-interactive/30 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 ${
                  visibleImages.length === 1
                    ? "max-w-lg mx-auto"
                    : visibleImages.length === 3 && index === 0
                      ? "row-span-2"
                      : ""
                }`}
              >
                <AuthenticatedImage
                  src={imageSrc}
                  alt="Post Image"
                  className={`rounded-2xl ${
                    visibleImages.length === 1
                      ? "w-full h-auto max-h-96 object-cover"
                      : visibleImages.length === 3 && index === 0
                        ? "w-full h-full object-cover"
                        : "w-full h-auto aspect-square object-cover"
                  }`}
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
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
