import type { Character } from "@/api";

export interface EditablePostSnapshot {
  content: string;
  images: string[];
  imagesPublic: boolean;
  url: string;
  characterId: number | null;
}

export interface EditablePostDraft {
  content: string;
  retainedImages: string[];
  addedImagesCount: number;
  imagesPublic: boolean;
  url: string;
  selectedCharacter: Character | null;
}

export function normalizeEditablePostSnapshot(
  input: Partial<EditablePostSnapshot>,
): EditablePostSnapshot {
  return {
    content: input.content ?? "",
    images: input.images ?? [],
    imagesPublic: input.imagesPublic ?? false,
    url: input.url ?? "",
    characterId: input.characterId ?? null,
  };
}

export function hasEditablePostChanges(
  original: EditablePostSnapshot,
  draft: EditablePostDraft,
): boolean {
  return (
    original.content.trim() !== draft.content.trim() ||
    original.url.trim() !== draft.url.trim() ||
    original.imagesPublic !== draft.imagesPublic ||
    original.characterId !== (draft.selectedCharacter?.id ?? null) ||
    draft.addedImagesCount > 0 ||
    original.images.length !== draft.retainedImages.length ||
    original.images.some(
      (image, index) => image !== draft.retainedImages[index],
    )
  );
}
