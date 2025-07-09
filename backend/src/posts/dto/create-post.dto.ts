import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsInt,
} from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Content must not exceed 2000 characters' })
  content?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  replyToId?: string | number;

  @IsOptional()
  @IsInt()
  characterId?: number;
}
