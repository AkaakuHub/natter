import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class UpdateCharacterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsOptional()
  name?: string;
}
