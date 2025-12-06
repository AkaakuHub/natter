import React, { useCallback, useState } from "react";
import { IconPhoto } from "@tabler/icons-react";

interface ImageDropZoneProps {
  onFilesAdd: (files: File[]) => void;
  onRequestFileDialog?: () => void;
  disabled?: boolean;
  canAddMore?: boolean;
  maxImages?: number;
}

const ImageDropZone = ({
  onFilesAdd,
  onRequestFileDialog,
  disabled = false,
  canAddMore = true,
  maxImages = 10,
}: ImageDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const isInactive = disabled || !canAddMore;

  const extractImageFiles = useCallback((fileList: FileList | File[]) => {
    return Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (isInactive) return;

      const files = extractImageFiles(event.dataTransfer.files);
      if (files.length === 0) return;

      onFilesAdd(files);
    },
    [extractImageFiles, isInactive, onFilesAdd],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (isInactive) return;
      event.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    },
    [isInactive],
  );

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (isInactive) return;
    onRequestFileDialog?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isInactive) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRequestFileDialog?.();
    }
  };

  const helperText = canAddMore
    ? "画像をドラッグ＆ドロップ、クリック、または ⌘V / Ctrl+V で追加"
    : `画像は最大${maxImages}枚までです。不要な画像を削除してから追加してください。`;

  return (
    <div
      role="button"
      tabIndex={isInactive ? -1 : 0}
      aria-disabled={isInactive}
      className={`mt-4 rounded-2xl border-2 border-dashed p-4 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive/70 ${
        isInactive
          ? "border-border-muted text-text-muted opacity-70 cursor-not-allowed"
          : isDragging
            ? "border-interactive bg-interactive/10 text-text"
            : "border-border text-text-muted hover:border-interactive cursor-pointer"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-full p-2 ${
            isInactive
              ? "bg-surface"
              : isDragging
                ? "bg-interactive text-text-inverse"
                : "bg-surface text-interactive"
          }`}
        >
          <IconPhoto size={20} />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-text">画像を追加</span>
          <span className="text-xs text-text-muted">{helperText}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageDropZone;
