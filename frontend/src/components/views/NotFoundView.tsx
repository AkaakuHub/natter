"use client";

import React from "react";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";

const NotFoundView: React.FC = () => {
  const { navigate } = useTrueSPARouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text mb-2">
          Page Not Found
        </h2>
        <p className="text-text-secondary mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-interactive text-text-inverse rounded-lg hover:bg-interactive-hover transition-colors"
          >
            Go Home
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-border text-text rounded-lg hover:bg-surface-variant transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundView;
