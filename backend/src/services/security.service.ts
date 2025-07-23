import { Injectable } from '@nestjs/common';
import { Character } from '@prisma/client';

@Injectable()
export class SecurityService {
  shouldRevealSecrets(): boolean {
    return process.env.IS_REVEADED_SECRETS === 'true';
  }

  hideUrlIfNeeded(
    url: string | null,
    currentUserId: string | undefined,
    authorId: string | null,
  ): string | null {
    if (!url) return url;
    if (this.shouldRevealSecrets()) return url;
    if (currentUserId && authorId && currentUserId === authorId) return url;
    return '???';
  }

  hideCharacterNameIfNeeded(
    character: Character | null,
    currentUserId: string | undefined,
    authorId: string | null,
  ): Character | null {
    if (!character) return character;
    if (this.shouldRevealSecrets()) return character;
    if (currentUserId && authorId && currentUserId === authorId)
      return character;
    return {
      ...character,
      name: '?'.repeat(character.name.length),
    };
  }

  hideCharacterInListIfNeeded(
    character: Character,
    currentUserId: string | undefined,
    ownerId: string,
  ): Character {
    const shouldHide = !this.shouldRevealSecrets() && currentUserId !== ownerId;
    return {
      ...character,
      name: shouldHide ? '?'.repeat(character.name.length) : character.name,
    };
  }
}
