import React from "react";

interface ReplyToIndicatorProps {
  replyTo: {
    id: number;
    content?: string;
    author?: {
      id: string;
      name: string;
    };
  };
  onReplyToClick: () => void;
}

const ReplyToIndicator = ({
  replyTo,
  onReplyToClick,
}: ReplyToIndicatorProps) => {
  return (
    <div className="mb-3 p-3 bg-interactive-bg border-l-4 border-interactive/30 rounded-r-lg">
      <p className="text-interactive text-sm">
        <span className="font-medium">返信先:</span>{" "}
        <button
          className="text-interactive hover:text-interactive-hover hover:underline font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onReplyToClick();
          }}
        >
          @{replyTo.author?.name || "Unknown User"}
        </button>
      </p>
    </div>
  );
};

export default ReplyToIndicator;
