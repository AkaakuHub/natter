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
    return ApiClient.get<Post[]>("/posts");
  }

  static async getPostById(id: number): Promise<Post> {
    return ApiClient.get<Post>(`/posts/${id}`);
  }

  static async getPostsByUser(userId: string): Promise<Post[]> {
    return ApiClient.get<Post[]>(`/posts?userId=${userId}`);
  }

  static async getMediaPosts(): Promise<Post[]> {
    return ApiClient.get<Post[]>("/posts?type=media");
  }

  static async getLikedPosts(userId: string): Promise<Post[]> {
    return ApiClient.get<Post[]>(`/posts?type=liked&userId=${userId}`);
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

  static async likePost(postId: number, userId: string): Promise<LikeResponse> {
    return ApiClient.post<LikeResponse>(`/posts/${postId}/like`, {
      userId,
    });
  }

  static async getPostLikes(postId: number): Promise<PostLikesResponse> {
    return ApiClient.get<PostLikesResponse>(`/posts/${postId}/likes`);
  }

  static async getReplies(postId: number): Promise<Post[]> {
    return ApiClient.get<Post[]>(`/posts/${postId}/replies`);
  }
}
