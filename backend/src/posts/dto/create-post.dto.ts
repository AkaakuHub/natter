export class CreatePostDto {
  title?: string;
  content?: string;
  images?: string[];
  authorId?: number;
  key?: string; // For authentication, not stored in DB
}