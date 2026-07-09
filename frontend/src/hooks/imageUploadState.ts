export interface ImageUploadSelection {
  filesToAdd: File[];
  limitMessage: string | null;
}

export function selectImageFilesToAdd(
  currentImageCount: number,
  files: File[],
  maxImages: number,
): ImageUploadSelection {
  const remainingSlots = maxImages - currentImageCount;

  if (remainingSlots <= 0) {
    return {
      filesToAdd: [],
      limitMessage: `画像は最大${maxImages}枚までアップロードできます`,
    };
  }

  const filesToAdd = files.slice(0, remainingSlots);

  return {
    filesToAdd,
    limitMessage:
      files.length > remainingSlots
        ? `画像は最大${maxImages}枚までです。${remainingSlots}枚のみ追加されました。`
        : null,
  };
}
