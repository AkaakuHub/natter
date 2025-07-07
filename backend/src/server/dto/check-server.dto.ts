import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CheckServerDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
