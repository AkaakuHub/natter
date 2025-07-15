import React from "react";
import { parseTextWithUrls, TextSegment } from "@/utils/textUtils";

interface RichTextProps {
  children: string;
  className?: string;
  onTextSelect?: (e: React.MouseEvent) => void;
}

const RichText: React.FC<RichTextProps> = ({
  children,
  className = "",
  onTextSelect,
}) => {
  const { segments } = parseTextWithUrls(children);

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
  );
};

export default RichText;
