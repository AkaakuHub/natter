import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  imagesPublic?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'URL must not exceed 500 characters' })
  url?: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  replyToId?: string | number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(value as string, 10);
    return isNaN(parsed) ? value : parsed;
  })
  @IsInt()
  characterId?: number;
}
