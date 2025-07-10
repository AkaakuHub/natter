import { useMemo } from "react";

interface UseFormValidationResult {
  remainingChars: number;
  isValid: boolean;
  hasContent: boolean;
  isOverLimit: boolean;
}

export const useFormValidation = (
  content: string,
  imageCount: number,
  characterLimit: number = 280,
  hasCharacter: boolean = false,
): UseFormValidationResult => {
  const remainingChars = characterLimit - content.length;
  const hasContent =
    content.trim().length > 0 || imageCount > 0 || hasCharacter;
  const isOverLimit = remainingChars < 0;
  const isValid = hasContent && !isOverLimit;

  return useMemo(
    () => ({
      remainingChars,
      isValid,
      hasContent,
      isOverLimit,
    }),
    [remainingChars, isValid, hasContent, isOverLimit],
  );
};
