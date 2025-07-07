import { useState } from "react";

interface UseImageModalResult {
  selectedImageIndex: number;
  isModalOpen: boolean;
  handleImageClick: (index: number) => void;
  closeImageModal: () => void;
  handlePreviousImage: () => void;
  handleNextImage: () => void;
}

export const useImageModal = (): UseImageModalResult => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImageIndex(-1);
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    setSelectedImageIndex(selectedImageIndex + 1);
  };

  return {
    selectedImageIndex,
    isModalOpen,
    handleImageClick,
    closeImageModal,
    handlePreviousImage,
    handleNextImage,
  };
};
