import { IsString, IsNotEmpty } from 'class-validator';

export class CheckServerDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}