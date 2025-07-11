"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ExtendedSession } from "@/types";

interface WelcomeProps {
  session: ExtendedSession;
  onUserCreated: () => Promise<void>;
}

const Welcome = ({ session, onUserCreated }: WelcomeProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateUser = async () => {
    try {
      setIsCreating(true);
      setError(null);

      await onUserCreated();
    } catch (err) {
      console.error("Failed to create user:", err);
      setError("ユーザーの作成に失敗しました");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-interactive-bg to-surface-variant p-4">
      <div className="bg-surface rounded-lg shadow-lg p-8 max-w-md w-full text-center border border-border">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text mb-2">初めまして！</h1>
          <p className="text-text-secondary">Natterへようこそ🎉</p>
        </div>

        <div className="mb-6">
          <Image
            src={session.user.image || "/no_avatar_image_128x128.png"}
            alt={session.user.name || "User"}
            width={96}
            height={96}
            className="rounded-full mx-auto border-4 border-interactive"
          />
          <h2 className="text-xl font-semibold mt-4 text-text">
            {session.user.name}
          </h2>
          {session.user.email && (
            <p className="text-text-muted">{session.user.email}</p>
          )}
        </div>

        <div className="mb-6">
          <p className="text-text-secondary text-sm">
            Twitterアカウントでログインが完了しました。
            <br />
            アカウントを作成して今すぐ始めましょう！
          </p>
        </div>

        {error && <div className="mb-4 text-error text-sm">{error}</div>}

        <Button
          onClick={handleCreateUser}
          disabled={isCreating}
          className="w-full bg-interactive hover:bg-interactive-hover text-text-inverse font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isCreating ? "作成中..." : "アカウントを作成"}
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
