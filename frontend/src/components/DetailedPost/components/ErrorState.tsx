import React from "react";

interface ErrorStateProps {
  error?: string | null;
  onBack: () => void;
  canInteract?: boolean;
}

const ErrorState = ({ error, onBack, canInteract = true }: ErrorStateProps) => {
  return (
    <div className="bg-surface-variant min-h-full">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-xl shadow-md border border-border p-8 text-center">
          <div className="text-error text-lg font-medium">
            {error || "ポストが見つかりませんでした"}
          </div>
          {canInteract && (
            <button
              onClick={onBack}
              className="mt-4 px-6 py-2 bg-interactive text-text-inverse rounded-lg hover:bg-interactive-hover transition-colors"
            >
              戻る
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
