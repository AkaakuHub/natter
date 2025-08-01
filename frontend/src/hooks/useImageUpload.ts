import { useState, useCallback } from "react";

interface UseImageUploadResult {
  images: File[];
  imagePreviewUrls: string[];
  handleImageAdd: () => void;
  handleImageRemove: (index: number) => void;
  clearImages: () => void;
}

export const useImageUpload = (
  maxImages: number = 10,
): UseImageUploadResult => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const handleImageAdd = useCallback(() => {
    if (images.length >= maxImages) {
      alert(`画像は最大${maxImages}枚までアップロードできます`);
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    // iOS Safari対応: input要素を画面外に配置して非表示にする（display:noneではなく）
    input.style.position = "fixed";
    input.style.top = "-100px";
    input.style.left = "-100px";
    input.style.width = "1px";
    input.style.height = "1px";
    input.style.opacity = "0";
    input.style.pointerEvents = "none";

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const fileArray = Array.from(files);
        const remainingSlots = maxImages - images.length;

        // ファイルサイズバリデーション（10MB制限）
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        const validFiles = fileArray.filter((file) => {
          if (file.size > maxFileSize) {
            alert(
              `ファイル "${file.name}" は10MBを超えています。10MB以下のファイルを選択してください。`,
            );
            return false;
          }
          return true;
        });

        if (validFiles.length === 0) {
          return;
        }

        const filesToAdd = validFiles.slice(0, remainingSlots);

        setImages((prev) => [...prev, ...filesToAdd]);

        const previewUrls = filesToAdd.map((file) => URL.createObjectURL(file));
        setImagePreviewUrls((prev) => [...prev, ...previewUrls]);

        if (validFiles.length > remainingSlots) {
          alert(
            `画像は最大${maxImages}枚までです。${remainingSlots}枚のみ追加されました。`,
          );
        }
      }

      // iOS Safari対応: 使用後にDOMから削除
      document.body.removeChild(input);
    };

    // iOS Safari対応: input要素をDOMに追加してからクリック
    document.body.appendChild(input);

    // iOS Safari対応: わずかな遅延を設けてからクリックイベントを発火
    setTimeout(() => {
      input.click();
    }, 10);
  }, [images.length, maxImages]);

  const handleImageRemove = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const clearImages = useCallback(() => {
    setImagePreviewUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setImages([]);
  }, []);

  return {
    images,
    imagePreviewUrls,
    handleImageAdd,
    handleImageRemove,
    clearImages,
  };
};
