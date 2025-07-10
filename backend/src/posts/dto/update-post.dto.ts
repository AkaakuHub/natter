import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class UpdatePostDto {
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
  @MaxLength(500, { message: 'URL must not exceed 500 characters' })
  url?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
