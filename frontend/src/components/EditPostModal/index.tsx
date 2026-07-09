"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Character, Post } from "@/api/types";
import type { CharacterTagSelectorHandle } from "@/components/CharacterTagSelector";
import {
  hasEditablePostChanges,
  normalizeEditablePostSnapshot,
} from "@/domain/posts/editPostChanges";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useImageUpload } from "@/hooks/useImageUpload";
import { usePostEdit } from "@/hooks/usePostEdit";
import { useScrollLock } from "@/hooks/useScrollLock";
import { decodeContentForEditing } from "@/utils/decodeContent";
import { getImageUrl } from "@/utils/postUtils";
import { ui } from "@/styles/ui";

import EditForm from "./components/EditForm";
import ModalHeader from "./components/ModalHeader";

interface EditPostModalProps {
  isOpen: boolean;
  post: Post;
  onClose: () => void;
  onEditSuccess?: (updatedPost: Post) => void;
}

const EditPostModal = ({
  isOpen,
  post,
  onClose,
  onEditSuccess,
}: EditPostModalProps) => {
  useScrollLock(isOpen);

  const [content, setContent] = useState(
    decodeContentForEditing(post.content || ""),
  );
  const [retainedImages, setRetainedImages] = useState(post.images || []);
  const [url, setUrl] = useState(post.url || "");
  const [imagesPublic, setImagesPublic] = useState(post.imagesPublic ?? false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    post.character ?? null,
  );
  const characterSelectorRef = useRef<CharacterTagSelectorHandle>(null);
  const characterLimit = 280;
  const maxImages = 10;

  const { isEditing, editPost } = usePostEdit();
  const {
    images,
    imagePreviewUrls,
    handleImageAdd,
    handleFilesAdd,
    handleImageRemove: handleNewImageRemove,
    clearImages,
  } = useImageUpload(maxImages);

  const allImagePreviewUrls = useMemo(
    () => [
      ...retainedImages.map((image) => getImageUrl(image)),
      ...imagePreviewUrls,
    ],
    [imagePreviewUrls, retainedImages],
  );
  const originalSnapshot = useMemo(
    () =>
      normalizeEditablePostSnapshot({
        content: decodeContentForEditing(post.content || ""),
        images: post.images,
        imagesPublic: post.imagesPublic,
        url: post.url,
        characterId: post.character?.id ?? post.characterId ?? null,
      }),
    [
      post.character?.id,
      post.characterId,
      post.content,
      post.images,
      post.imagesPublic,
      post.url,
    ],
  );
  const hasChanges = hasEditablePostChanges(originalSnapshot, {
    content,
    retainedImages,
    addedImagesCount: images.length,
    imagesPublic,
    url,
    selectedCharacter,
  });
  const { remainingChars, isValid } = useFormValidation(
    content,
    retainedImages.length + images.length,
    characterLimit,
    !!selectedCharacter,
  );

  useEffect(() => {
    if (isOpen) {
      setContent(decodeContentForEditing(post.content || ""));
      setRetainedImages(post.images || []);
      setUrl(post.url || "");
      setImagesPublic(post.imagesPublic ?? false);
      setSelectedCharacter(post.character ?? null);
      clearImages();
    }
  }, [
    isOpen,
    post.id,
    post.content,
    post.images,
    post.imagesPublic,
    post.url,
    post.character,
    clearImages,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !hasChanges) {
      return;
    }

    const ensuredCharacter =
      await characterSelectorRef.current?.ensureCharacterSelection();
    const updatedPost = await editPost(post.id, {
      content: content.trim(),
      retainedImages,
      newImages: images,
      imagesPublic,
      url,
      characterId: (ensuredCharacter ?? selectedCharacter)?.id ?? null,
    });
    if (updatedPost) {
      onEditSuccess?.(updatedPost);
      onClose();
    }
  };

  const resetForm = () => {
    setContent(decodeContentForEditing(post.content || ""));
    setRetainedImages(post.images || []);
    setUrl(post.url || "");
    setImagesPublic(post.imagesPublic ?? false);
    setSelectedCharacter(post.character ?? null);
    clearImages();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageRemove = (index: number) => {
    if (index < retainedImages.length) {
      setRetainedImages((currentImages) =>
        currentImages.filter((_, currentIndex) => currentIndex !== index),
      );
      return;
    }

    handleNewImageRemove(index - retainedImages.length);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="mobile-safe-overlay fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-overlay p-3 sm:p-4"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className={`${ui.surface.modal} mobile-safe-modal mt-2 flex w-full max-w-lg flex-col overflow-hidden sm:mt-16 sm:max-h-[80dvh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader onClose={handleClose} />

        <EditForm
          content={content}
          onContentChange={setContent}
          url={url}
          onUrlChange={setUrl}
          selectedCharacter={selectedCharacter}
          onCharacterChange={setSelectedCharacter}
          characterSelectorRef={characterSelectorRef}
          imagePreviewUrls={allImagePreviewUrls}
          onImageRemove={handleImageRemove}
          onImageAdd={handleImageAdd}
          onFilesAdd={handleFilesAdd}
          imagesPublic={imagesPublic}
          onImagesPublicChange={setImagesPublic}
          onSubmit={handleSubmit}
          remainingChars={remainingChars}
          isSubmitting={isEditing}
          isValid={isValid}
          hasChanges={hasChanges}
          characterLimit={characterLimit}
          autoFocus={true}
          maxImages={maxImages}
        />
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default EditPostModal;
