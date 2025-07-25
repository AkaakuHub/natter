import { IsBoolean } from 'class-validator';

export class ToggleSecretsDto {
  @IsBoolean()
  isRevealedSecrets: boolean;
}
