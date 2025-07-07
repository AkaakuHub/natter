import { useState } from "react";

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

  const handleImageAdd = () => {
    if (images.length >= maxImages) {
      alert(`画像は最大${maxImages}枚までアップロードできます`);
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const fileArray = Array.from(files);
        const remainingSlots = maxImages - images.length;
        const filesToAdd = fileArray.slice(0, remainingSlots);

        setImages((prev) => [...prev, ...filesToAdd]);

        const previewUrls = filesToAdd.map((file) => URL.createObjectURL(file));
        setImagePreviewUrls((prev) => [...prev, ...previewUrls]);

        if (fileArray.length > remainingSlots) {
          alert(
            `画像は最大${maxImages}枚までです。${remainingSlots}枚のみ追加されました。`,
          );
        }
      }
    };

    input.click();
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearImages = () => {
    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreviewUrls([]);
  };

  return {
    images,
    imagePreviewUrls,
    handleImageAdd,
    handleImageRemove,
    clearImages,
  };
};
