import { ApiClient } from './client';
import { Post, CreatePostDto, UpdatePostDto, LikeResponse, PostLikesResponse } from './types';

export class PostsApi {
  static async getAllPosts(): Promise<Post[]> {
    return ApiClient.get<Post[]>('/posts');
  }

  static async getPostById(id: number): Promise<Post> {
    return ApiClient.get<Post>(`/posts/${id}`);
  }

  static async getPostsByUser(userId: number): Promise<Post[]> {
    return ApiClient.get<Post[]>(`/posts?userId=${userId}`);
  }

  static async getMediaPosts(): Promise<Post[]> {
    return ApiClient.get<Post[]>('/posts?type=media');
  }

  static async getLikedPosts(userId: number): Promise<Post[]> {
    return ApiClient.get<Post[]>(`/posts?type=liked&userId=${userId}`);
  }

  static async createPost(data: CreatePostDto): Promise<Post> {
    const passkey = process.env.NEXT_PUBLIC_PASSKEY || '1234';
    return ApiClient.post<Post>('/posts', {
      ...data,
      key: passkey,
    });
  }

  static async updatePost(id: number, data: UpdatePostDto): Promise<Post> {
    const passkey = process.env.NEXT_PUBLIC_PASSKEY || '1234';
    return ApiClient.patch<Post>(`/posts/${id}`, {
      ...data,
      key: passkey,
    });
  }

  static async deletePost(id: number): Promise<void> {
    const passkey = process.env.NEXT_PUBLIC_PASSKEY || '1234';
    return ApiClient.delete<void>(`/posts/${id}`, {
      key: passkey,
    });
  }

  static async likePost(postId: number, userId: number): Promise<LikeResponse> {
    const passkey = process.env.NEXT_PUBLIC_PASSKEY || '1234';
    return ApiClient.post<LikeResponse>(`/posts/${postId}/like`, {
      userId,
      key: passkey,
    });
  }

  static async getPostLikes(postId: number): Promise<PostLikesResponse> {
    return ApiClient.get<PostLikesResponse>(`/posts/${postId}/likes`);
  }
}