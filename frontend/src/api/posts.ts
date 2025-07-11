import { ApiClient } from "./client";
import {
  Post,
  CreatePostDto,
  UpdatePostDto,
  LikeResponse,
  PostLikesResponse,
} from "./types";

export class PostsApi {
  static async getAllPosts(): Promise<Post[]> {
    try {
      const posts = await ApiClient.get<Post[]>("/posts");
      return Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error("Error fetching all posts:", error);
      return [];
    }
  }

  static async searchPosts(searchTerm: string, type?: string): Promise<Post[]> {
    try {
      const params = new URLSearchParams();
      params.append("search", searchTerm);
      if (type) {
        params.append("type", type);
      }
      const posts = await ApiClient.get<Post[]>(`/posts?${params.toString()}`);
      return Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error("Error searching posts:", error);
      return [];
    }
  }

  static async getPostById(id: number): Promise<Post> {
    try {
      return await ApiClient.get<Post>(`/posts/${id}`); // Allow both authenticated and unauthenticated access
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      throw error;
    }
  }

  static async getPostsByUser(userId: string): Promise<Post[]> {
    try {
      const posts = await ApiClient.get<Post[]>(`/posts?userId=${userId}`);
      return Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error("Error fetching posts by user:", error);
      return [];
    }
  }

  static async getMediaPosts(): Promise<Post[]> {
    try {
      const posts = await ApiClient.get<Post[]>("/posts?type=media");
      return Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error("Error fetching media posts:", error);
      return [];
    }
  }

  static async getLikedPosts(userId: string): Promise<Post[]> {
    try {
      const posts = await ApiClient.get<Post[]>(
        `/posts?type=liked&userId=${userId}`,
      );
      return Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error("Error fetching liked posts:", error);
      return [];
    }
  }

  static async createPost(data: CreatePostDto): Promise<Post> {
    return ApiClient.post<Post>("/posts", data);
  }

  // FormDataを使った投稿作成（画像付き）
  static async createPostWithImages(formData: FormData): Promise<Post> {
    return ApiClient.postFormData<Post>("/posts", formData);
  }

  static async updatePost(id: number, data: UpdatePostDto): Promise<Post> {
    return ApiClient.patch<Post>(`/posts/${id}`, data);
  }

  // FormDataを使った投稿編集（画像付き）
  static async updatePostWithImages(
    id: number,
    formData: FormData,
  ): Promise<Post> {
    return ApiClient.patchFormData<Post>(`/posts/${id}`, formData);
  }

  static async deletePost(id: number): Promise<void> {
    return ApiClient.delete<void>(`/posts/${id}`);
  }

  static async likePost(postId: number): Promise<LikeResponse> {
    console.log("🔗 PostsApi.likePost called:", { postId });
    const response = await ApiClient.post<LikeResponse>(
      `/posts/${postId}/like`,
      {},
    );
    console.log("🔗 PostsApi.likePost response:", response);
    return response;
  }

  static async getPostLikes(postId: number): Promise<PostLikesResponse> {
    return ApiClient.get<PostLikesResponse>(`/posts/${postId}/likes`);
  }

  static async getReplies(postId: number): Promise<Post[]> {
    try {
      const posts = await ApiClient.get<Post[]>(`/posts/${postId}/replies`);
      return Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error("Error fetching replies:", error);
      return [];
    }
  }

  static async getTrendingPosts(limit?: number): Promise<Post[]> {
    try {
      const params = new URLSearchParams();
      if (limit) {
        params.append("limit", limit.toString());
      }
      const posts = await ApiClient.get<Post[]>(
        `/posts/trending?${params.toString()}`,
      );
      return Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      return [];
    }
  }
}
