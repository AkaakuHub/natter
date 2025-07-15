import { IsString, IsUrl, IsOptional } from 'class-validator';

export class GetMetadataDto {
  @IsUrl()
  url: string;
}

export class UrlMetadataResponseDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  favicon?: string;

  @IsOptional()
  cachedAt?: Date;
}
