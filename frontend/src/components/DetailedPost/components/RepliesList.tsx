import React from "react";
import { Post } from "@/api";
import PostComponent from "@/components/Post";
import { transformReplyToPostComponent } from "@/utils/postTransformers";

interface RepliesListProps {
  replies: Post[];
}

const RepliesList = ({ replies }: RepliesListProps) => {
  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-100">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          リプライ ({replies.length})
        </h3>
        <div className="space-y-4">
          {replies.map((reply) => {
            const transformed = transformReplyToPostComponent(reply);
            if (!transformed) return null;

            const { transformedUser, transformedPost } = transformed;

            return (
              <div key={reply.id} className="border border-gray-100 rounded-lg">
                <PostComponent user={transformedUser} post={transformedPost} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RepliesList;
