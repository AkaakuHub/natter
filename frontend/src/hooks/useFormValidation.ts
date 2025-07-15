import { useMemo } from "react";
import { calculateEffectiveLength } from "@/utils/textUtils";

interface UseFormValidationResult {
  remainingChars: number;
  isValid: boolean;
  hasContent: boolean;
  isOverLimit: boolean;
  effectiveLength: number;
  actualLength: number;
}

export const useFormValidation = (
  content: string,
  imageCount: number,
  characterLimit: number = 280,
  hasCharacter: boolean = false,
): UseFormValidationResult => {
  const effectiveLength = calculateEffectiveLength(content);
  const actualLength = content.length;
  const remainingChars = characterLimit - effectiveLength;
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
      effectiveLength,
      actualLength,
    }),
    [
      remainingChars,
      isValid,
      hasContent,
      isOverLimit,
      effectiveLength,
      actualLength,
    ],
  );
};
