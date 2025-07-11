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
  imagesPublic?: boolean;
  url?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  authorId?: string;
  author?: User;
  likes?: Like[];
  characterId?: number;
  character?: Character;
  replyToId?: number;
  replyTo?: Post;
  replies?: Post[];
  _count?: {
    likes: number;
    replies: number;
  };
}

interface Like {
  id: number;
  userId: string;
  postId: number;
  createdAt: string;
  user?: User;
}

export interface CreatePostDto {
  title?: string;
  content?: string;
  images?: string[];
  imagesPublic?: boolean;
  url?: string;
  authorId?: string;
  replyToId?: number;
  characterId?: number;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  images?: string[];
  imagesPublic?: boolean;
  url?: string;
  published?: boolean;
}

export interface LikeResponse {
  liked: boolean;
}

export interface PostLikesResponse {
  count: number;
  users: User[];
}

export interface Character {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  postsCount: number;
  _count?: {
    posts: number;
  };
}

export interface CreateCharacterDto {
  name: string;
}

export interface UpdateCharacterDto {
  name?: string;
}
