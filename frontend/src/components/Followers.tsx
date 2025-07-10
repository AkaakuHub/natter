"use client";

import React from "react";

interface FollowersComponentProps {
  userId: string;
}

const FollowersComponent = ({ userId }: FollowersComponentProps) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Followers</h1>
      <div className="text-text-secondary">
        フォロワー一覧（ユーザーID: {userId}）
      </div>
    </div>
  );
};

export default FollowersComponent;
