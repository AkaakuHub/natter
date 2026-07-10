import React from "react";
import Image from "next/image";
import { IconX } from "@tabler/icons-react";
import AuthenticatedImage from "@/components/common/AuthenticatedImage";
import { useImagePreload } from "@/hooks/useImagePreload";
import { ui } from "@/styles/ui";
import {
  getDirectImagePreviewUrls,
  isAuthenticatedPostImagePreview,
} from "./imagePreviewSource";

interface ImagePreviewProps {
  imageUrls: string[];
  onRemove: (index: number) => void;
}

const ImagePreview = ({ imageUrls, onRemove }: ImagePreviewProps) => {
  const directImagePreviewUrls = React.useMemo(
    () => getDirectImagePreviewUrls(imageUrls),
    [imageUrls],
  );
  useImagePreload(directImagePreviewUrls);

  if (imageUrls.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {imageUrls.map((imageUrl, index) => (
        <div key={index} className="relative">
          {isAuthenticatedPostImagePreview(imageUrl) ? (
            <AuthenticatedImage
              src={imageUrl}
              alt={`添付画像 ${index + 1}`}
              className="w-full h-32 overflow-hidden rounded-lg border border-border object-cover"
              width={200}
              height={128}
            />
          ) : (
            <Image
              src={imageUrl}
              alt={`添付画像 ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-border"
              width={200}
              height={128}
            />
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className={`${ui.button.icon} absolute top-2 right-2 bg-surface text-error hover:bg-error-bg hover:text-error`}
          >
            <IconX size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;
