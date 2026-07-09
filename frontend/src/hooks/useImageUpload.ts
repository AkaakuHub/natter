import { useState, useCallback, useRef } from "react";
import { selectImageFilesToAdd } from "@/hooks/imageUploadState";
import { normalizePostImages } from "@/utils/normalizePostImages";

interface UseImageUploadResult {
  images: File[];
  imagePreviewUrls: string[];
  handleImageAdd: () => void;
  handleFilesAdd: (files: File[] | FileList | null) => Promise<void>;
  handleImageRemove: (index: number) => void;
  clearImages: () => void;
}

export const useImageUpload = (
  maxImages: number = 10,
): UseImageUploadResult => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const imagesRef = useRef<File[]>([]);

  const handleFilesAdd = useCallback(
    async (fileSource: File[] | FileList | null) => {
      if (!fileSource) return;

      const incomingFiles = Array.from(fileSource).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (incomingFiles.length === 0) {
        return;
      }

      let validFiles: File[];
      try {
        validFiles = await normalizePostImages(incomingFiles);
      } catch (error) {
        alert(
          error instanceof Error ? error.message : "画像の変換に失敗しました",
        );
        return;
      }

      if (validFiles.length === 0) {
        return;
      }

      const { filesToAdd, limitMessage } = selectImageFilesToAdd(
        imagesRef.current.length,
        validFiles,
        maxImages,
      );

      if (filesToAdd.length === 0) {
        if (limitMessage) {
          alert(limitMessage);
        }
        return;
      }

      imagesRef.current = [...imagesRef.current, ...filesToAdd];
      setImages(imagesRef.current);
      setImagePreviewUrls((prev) => [
        ...prev,
        ...filesToAdd.map((file) => URL.createObjectURL(file)),
      ]);

      if (limitMessage) {
        alert(limitMessage);
      }
    },
    [maxImages],
  );

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
      handleFilesAdd(files);

      // iOS Safari対応: 使用後にDOMから削除
      document.body.removeChild(input);
    };

    // iOS Safari対応: input要素をDOMに追加してからクリック
    document.body.appendChild(input);

    // iOS Safari対応: わずかな遅延を設けてからクリックイベントを発火
    setTimeout(() => {
      input.click();
    }, 10);
  }, [handleFilesAdd, images.length, maxImages]);

  const handleImageRemove = useCallback((index: number) => {
    imagesRef.current = imagesRef.current.filter((_, i) => i !== index);
    setImages(imagesRef.current);
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
    imagesRef.current = [];
    setImages([]);
  }, []);

  return {
    images,
    imagePreviewUrls,
    handleImageAdd,
    handleFilesAdd,
    handleImageRemove,
    clearImages,
  };
};
