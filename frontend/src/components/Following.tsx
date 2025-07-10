"use client";

import React from "react";

interface FollowingComponentProps {
  userId: string;
}

const FollowingComponent = ({ userId }: FollowingComponentProps) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Following</h1>
      <div className="text-text-secondary">
        フォロー中のユーザー一覧（ユーザーID: {userId}）
      </div>
    </div>
  );
};

export default FollowingComponent;
