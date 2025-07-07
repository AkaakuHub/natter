import { useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useFormValidation } from "@/hooks/useFormValidation";

interface UseReplyModalResult {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  images: File[];
  imagePreviewUrls: string[];
  handleImageAdd: () => void;
  handleImageRemove: (index: number) => void;
  clearImages: () => void;
  remainingChars: number;
  isValid: boolean;
  handleSubmit: (
    e: React.FormEvent,
    onReplySubmit: (content: string, images: File[]) => Promise<void>,
    onClose: () => void,
  ) => Promise<void>;
  isSubmitting: boolean;
}

export const useReplyModal = (): UseReplyModalResult => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const characterLimit = 280;

  const {
    images,
    imagePreviewUrls,
    handleImageAdd,
    handleImageRemove,
    clearImages,
  } = useImageUpload(10);

  const { remainingChars, isValid } = useFormValidation(
    content,
    images.length,
    characterLimit,
  );

  const handleSubmit = async (
    e: React.FormEvent,
    onReplySubmit: (content: string, images: File[]) => Promise<void>,
    onClose: () => void,
  ) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) return;

    try {
      setIsSubmitting(true);
      await onReplySubmit(content.trim(), images);
      setContent("");
      clearImages();
      onClose();
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    content,
    setContent,
    images,
    imagePreviewUrls,
    handleImageAdd,
    handleImageRemove,
    clearImages,
    remainingChars,
    isValid,
    handleSubmit,
    isSubmitting,
  };
};