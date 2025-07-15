import React from "react";
import { parseTextWithUrls, TextSegment } from "@/utils/textUtils";
import UrlPreview from "./UrlPreview";

interface RichTextProps {
  children: string;
  className?: string;
  onTextSelect?: (e: React.MouseEvent) => void;
  showUrlPreviews?: boolean;
}

const RichText: React.FC<RichTextProps> = ({
  children,
  className = "",
  onTextSelect,
  showUrlPreviews = false,
}) => {
  const { segments } = parseTextWithUrls(children);

  // URLを抽出（プレビュー用）- 最初のURLのみ
  const urls = segments
    .filter((segment) => segment.type === "url")
    .map((segment) => segment.content)
    .slice(0, 1); // 最初のURLのみ

  const renderSegment = (segment: TextSegment, index: number) => {
    if (segment.type === "url") {
      return (
        <a
          key={index}
          href={segment.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-interactive hover:text-interactive-hover underline decoration-interactive/50 hover:decoration-interactive break-all transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {segment.content}
        </a>
      );
    }

    return <span key={index}>{segment.content}</span>;
  };

  return (
    <div>
      <span
        className={className}
        onMouseDown={(e) => {
          // テキスト選択を開始する場合は親のクリックイベントを無効化
          e.stopPropagation();
          onTextSelect?.(e);
        }}
        onMouseUp={(e) => {
          // テキストが選択されている場合は親のクリックイベントを無効化
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) {
            e.stopPropagation();
          }
          onTextSelect?.(e);
        }}
        onClick={(e) => {
          // テキストが選択されている場合は親のクリックイベントを無効化
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) {
            e.stopPropagation();
          }
        }}
      >
        {segments.map(renderSegment)}
      </span>

      {/* URL プレビュー */}
      {showUrlPreviews && urls.length > 0 && (
        <div className="mt-3 space-y-2">
          {urls.map((url, index) => (
            <UrlPreview key={index} url={url} className="max-w-md" />
          ))}
        </div>
      )}
    </div>
  );
};

export default RichText;
