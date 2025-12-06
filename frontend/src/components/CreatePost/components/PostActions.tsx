import React from "react";

interface PostActionsProps {
  onSubmit: () => void;
  remainingChars: number;
  isSubmitting: boolean;
  isValid: boolean;
  effectiveLength?: number;
  actualLength?: number;
}

const PostActions = ({
  onSubmit,
  remainingChars,
  isSubmitting,
  isValid,
  effectiveLength,
  actualLength,
}: PostActionsProps) => {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-muted">
      <div className="flex items-center gap-4">
        {/* 文字数カウンター */}
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              remainingChars < 20
                ? remainingChars < 0
                  ? "text-error"
                  : "text-warning"
                : "text-text-muted"
            }`}
          >
            {remainingChars}
          </span>
          {effectiveLength !== undefined &&
            actualLength !== undefined &&
            effectiveLength !== actualLength && (
              <span
                className="text-xs text-text-muted"
                title={`実際の文字数: ${actualLength}文字\n有効文字数: ${effectiveLength}文字 (URLは1/5でカウント)`}
              >
                ({effectiveLength}/{actualLength})
              </span>
            )}
        </div>
      </div>

      {/* 投稿ボタン */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || !isValid}
        className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors duration-200 ${
          isSubmitting || !isValid
            ? "bg-interactive-disabled text-text-inverse cursor-not-allowed"
            : "bg-interactive text-text-inverse hover:bg-interactive-hover"
        }`}
      >
        {isSubmitting ? "投稿中..." : "投稿"}
      </button>
    </div>
  );
};

export default PostActions;
