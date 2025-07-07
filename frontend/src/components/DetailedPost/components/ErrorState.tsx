import React from "react";

interface ErrorStateProps {
  error?: string | null;
  onBack: () => void;
}

const ErrorState = ({ error, onBack }: ErrorStateProps) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="text-red-500 text-lg font-medium">
            {error || "ポストが見つかりませんでした"}
          </div>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;