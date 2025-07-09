import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsString()
  userId: string;

  @IsString()
  actorId: string;

  @IsOptional()
  @IsInt()
  postId?: number;

  @IsOptional()
  @IsBoolean()
  read?: boolean;
}
