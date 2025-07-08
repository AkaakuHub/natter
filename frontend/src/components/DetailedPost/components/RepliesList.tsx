import React from "react";
import { Post } from "@/api";
import PostComponent from "@/components/Post";
import { transformPostToPostComponent } from "@/utils/postTransformers";

interface RepliesListProps {
  replies: Post[];
}

const RepliesList = ({ replies }: RepliesListProps) => {
  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border-muted">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          リプライ ({replies.length})
        </h3>
        <div>
          {replies.map((reply) => {
            const transformed = transformPostToPostComponent(reply);
            if (!transformed) return null;

            const { transformedUser, transformedPost } = transformed;

            return (
              <div key={reply.id} className="border border-border rounded-lg">
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
