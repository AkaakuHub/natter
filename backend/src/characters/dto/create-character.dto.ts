import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
