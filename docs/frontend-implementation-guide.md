# フロントエンド実装ガイド

## 認証システム実装の概要

バックエンドで実装された認証システムをフロントエンドで利用するための実装ガイドです。

## 1. 実装されているエンドポイント

### 認証関連
```typescript
// 認証トークン取得
POST /check-server
Body: { key: string, userId?: string }
Response: { status: 'OK', token: string, user?: UserInfo }

// エラーレスポンス
Response: { message: 'Invalid key', statusCode: 401 }
```

### 投稿関連（認証必須）
```typescript
// 投稿作成（認証必須）
POST /posts
Headers: { Authorization: 'Bearer <token>' }
Body: FormData with { title?, content?, replyToId?, images? }
Response: Post

// 投稿取得（認証不要）
GET /posts
GET /posts/:id
GET /posts?type=media
GET /posts?userId=<userId>
GET /posts?type=liked&userId=<userId>

// 投稿編集（認証+所有者チェック）
PATCH /posts/:id
Headers: { Authorization: 'Bearer <token>' }
Body: FormData with { title?, content?, images? }
Response: Post

// 投稿削除（認証+所有者チェック）
DELETE /posts/:id
Headers: { Authorization: 'Bearer <token>' }
Response: Post

// いいね機能（認証必須）
POST /posts/:id/like
Headers: { Authorization: 'Bearer <token>' }
Response: { liked: boolean }

// その他
GET /posts/:id/likes
GET /posts/:id/replies
```

## 2. フロントエンド認証フローの実装

### 2.1 認証状態管理

```typescript
// auth.types.ts
export interface User {
  id: string;
  name: string;
  twitterId: string;
  image?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

// auth.store.ts (Zustand例)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore extends AuthState {
  login: (key: string, userId?: string) => Promise<boolean>;
  logout: () => void;
  setToken: (token: string, user?: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      
      login: async (key: string, userId?: string) => {
        try {
          const response = await fetch('/api/check-server', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, userId }),
          });
          
          if (response.ok) {
            const data = await response.json();
            set({
              isAuthenticated: true,
              token: data.token,
              user: data.user,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        });
      },
      
      setToken: (token: string, user?: User) => {
        set({
          isAuthenticated: true,
          token,
          user,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 2.2 API クライアント実装

```typescript
// api.client.ts
import { useAuthStore } from './auth.store';

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  private getHeaders(includeAuth = true): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (includeAuth) {
      const { token } = useAuthStore.getState();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return headers;
  }
  
  // 投稿作成
  async createPost(data: {
    title?: string;
    content?: string;
    replyToId?: number;
    images?: File[];
  }) {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.replyToId) formData.append('replyToId', data.replyToId.toString());
    
    data.images?.forEach((file) => {
      formData.append('images', file);
    });
    
    const response = await fetch(`${this.baseUrl}/posts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    
    return response.json();
  }
  
  // 投稿編集
  async updatePost(id: number, data: {
    title?: string;
    content?: string;
    images?: File[];
  }) {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    
    data.images?.forEach((file) => {
      formData.append('images', file);
    });
    
    const response = await fetch(`${this.baseUrl}/posts/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update post');
    }
    
    return response.json();
  }
  
  // 投稿削除
  async deletePost(id: number) {
    const response = await fetch(`${this.baseUrl}/posts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
    
    return response.json();
  }
  
  // いいね切り替え
  async toggleLike(postId: number) {
    const response = await fetch(`${this.baseUrl}/posts/${postId}/like`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }
    
    return response.json();
  }
  
  // 投稿取得
  async getPosts(params?: {
    type?: 'media' | 'liked';
    userId?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.userId) searchParams.append('userId', params.userId);
    
    const response = await fetch(
      `${this.baseUrl}/posts?${searchParams.toString()}`,
      {
        headers: this.getHeaders(false), // 認証不要
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

### 2.3 認証が必要なコンポーネントの保護

```typescript
// components/ProtectedRoute.tsx
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) {
    return fallback || <div>Please log in to access this page.</div>;
  }
  
  return <>{children}</>;
}
```

### 2.4 React Hook の実装例

```typescript
// hooks/usePosts.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export function usePosts(params?: { type?: 'media' | 'liked'; userId?: string }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getPosts(params);
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [params?.type, params?.userId]);
  
  return { posts, loading, error, refetch: () => fetchPosts() };
}

// hooks/usePostMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
```

## 3. 重要な実装ポイント

### 3.1 エラーハンドリング
```typescript
// 401エラー（認証切れ）の処理
if (response.status === 401) {
  useAuthStore.getState().logout();
  router.push('/login');
}

// 403エラー（権限なし）の処理
if (response.status === 403) {
  toast.error('You do not have permission to perform this action');
}
```

### 3.2 ファイルアップロード
- `Content-Type: multipart/form-data` を使用
- 画像ファイルのみ許可: jpg, jpeg, png, gif, webp, avif
- 最大10ファイルまで

### 3.3 投稿の所有者チェック
```typescript
// 投稿の編集・削除ボタンの表示制御
const canEditPost = (post: Post) => {
  const { user } = useAuthStore.getState();
  return user && post.authorId === user.id;
};
```

### 3.4 認証トークンの自動更新
- JWTトークンの有効期限をチェック
- 期限切れ前に自動更新する仕組みの実装を推奨

## 4. 開発時の注意点

1. **CORS設定**: バックエンドで適切なCORS設定が必要
2. **環境変数**: API URLを環境変数で管理
3. **型安全性**: TypeScriptの型定義を活用
4. **エラー境界**: React Error Boundaryでエラーをキャッチ
5. **ローディング状態**: ユーザビリティのためローディング表示を実装

## 5. 実装順序の推奨

1. 認証システム（ログイン・ログアウト）
2. 投稿一覧表示
3. 投稿作成機能
4. 投稿編集・削除機能
5. いいね機能
6. ファイルアップロード機能
7. エラーハンドリングとUX改善