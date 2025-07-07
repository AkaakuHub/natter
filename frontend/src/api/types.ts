export interface User {
  id: string;
  name: string;
  image?: string;
  tel?: string;
  twitterId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
    likes: number;
  };
}

export interface Post {
  id: number;
  title?: string;
  content?: string;
  images: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  authorId?: string;
  author?: User;
  likes?: Like[];
  replyToId?: number;
  replyTo?: Post;
  replies?: Post[];
  _count?: {
    likes: number;
    replies: number;
  };
}

export interface CreatePostDto {
  title?: string;
  content?: string;
  images?: string[];
  authorId?: string;
  replyToId?: number;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  images?: string[];
  published?: boolean;
}

export interface LikeResponse {
  liked: boolean;
}

export interface PostLikesResponse {
  count: number;
  users: User[];
}

export interface Like {
  id: number;
  userId: string;
  postId: number;
  createdAt: string;
  user?: User;
}
