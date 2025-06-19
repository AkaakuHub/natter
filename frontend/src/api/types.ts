export interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
  tel?: string;
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
  authorId?: number;
  author?: User;
  likes?: Like[];
  _count?: {
    likes: number;
  };
}

export interface Like {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
  user?: User;
}

export interface CreatePostDto {
  title?: string;
  content?: string;
  images?: string[];
  authorId?: number;
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