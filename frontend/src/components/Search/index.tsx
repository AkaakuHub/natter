"use client";

import React, { useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";
import { PostsApi, Post, User } from "@/api";
import { transformPostToPostComponent } from "@/utils/postTransformers";
import PostComponent from "@/components/Post";
import { useInputFocus } from "@/hooks/useInputFocus";

interface SearchProps {
  currentUser?: User | null;
}

type SearchTab = "all" | "media";

const Search: React.FC<SearchProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useInputFocus() as React.RefObject<HTMLInputElement>;

  const performSearch = async (term: string, tab: SearchTab) => {
    if (!term.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const searchResults = await PostsApi.searchPosts(
        term.trim(),
        tab === "media" ? "media" : undefined,
      );
      setResults(searchResults);
    } catch (err) {
      console.error("Search failed:", err);
      setError("検索に失敗しました");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm, activeTab);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    if (searchTerm.trim() && hasSearched) {
      performSearch(searchTerm, tab);
    }
  };

  const handlePostUpdate = () => {
    // 投稿更新後の処理（必要に応じて検索結果を更新）
    if (searchTerm.trim() && hasSearched) {
      performSearch(searchTerm, activeTab);
    }
  };

  const handlePostDelete = (postId: number) => {
    setResults((prevResults) =>
      prevResults.filter((post) => post.id !== postId),
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 検索ヘッダー */}
      <div className="bg-surface border-b border-border p-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <IconSearch
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
            />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="投稿、ユーザーを検索..."
              className="w-full pl-10 pr-10 py-3 bg-surface-variant border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-interactive focus:border-transparent text-text placeholder-text-muted"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-surface-hover transition-colors"
              >
                <IconX size={16} className="text-text-muted" />
              </button>
            )}
          </div>
        </form>

        {/* タブ */}
        <div className="flex gap-0 mt-4">
          <button
            onClick={() => handleTabChange("all")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-interactive text-interactive"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => handleTabChange("media")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "media"
                ? "border-interactive text-interactive"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            画像
          </button>
        </div>
      </div>

      {/* 検索結果 */}
      <div>
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interactive"></div>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-error">{error}</p>
          </div>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-text-muted">検索結果が見つかりませんでした</p>
          </div>
        )}

        {!loading && !error && !hasSearched && (
          <div className="p-8 text-center">
            <IconSearch size={48} className="mx-auto mb-4 text-text-muted" />
            <p className="text-text-muted mb-2">投稿やユーザーを検索</p>
            <p className="text-sm text-text-muted">
              検索したいキーワードを入力してください
            </p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div>
            <div className="p-4 border-b border-border">
              <p className="text-sm text-text-muted">
                {results.length}件の結果が見つかりました
              </p>
            </div>
            {results.map((post) => {
              const transformed = transformPostToPostComponent(post);
              if (!transformed) return null;

              const { transformedUser, transformedPost } = transformed;

              return (
                <PostComponent
                  key={post.id}
                  user={transformedUser}
                  post={transformedPost}
                  currentUser={currentUser}
                  onPostUpdate={handlePostUpdate}
                  onPostDelete={() => handlePostDelete(post.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
