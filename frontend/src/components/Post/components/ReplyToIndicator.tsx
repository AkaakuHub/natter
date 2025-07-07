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
    <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-200 rounded-r-lg">
      <p className="text-blue-700 text-sm">
        <span className="font-medium">返信先:</span>{" "}
        <button
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
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
