import { Injectable } from '@nestjs/common';
import { Character } from '@prisma/client';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class SecurityService {
  constructor(private adminService: AdminService) {}

  async shouldRevealSecrets(): Promise<boolean> {
    return await this.adminService.isRevealedSecretsEnabled();
  }

  async hideUrlIfNeeded(
    url: string | null,
    currentUserId: string | undefined,
    authorId: string | null,
  ): Promise<string | null> {
    if (!url) return url;
    if (await this.shouldRevealSecrets()) return url;
    if (currentUserId && authorId && currentUserId === authorId) return url;
    return '???';
  }

  async hideCharacterNameIfNeeded(
    character: Character | null,
    currentUserId: string | undefined,
    authorId: string | null,
  ): Promise<Character | null> {
    if (!character) return character;
    if (await this.shouldRevealSecrets()) return character;
    if (currentUserId && authorId && currentUserId === authorId)
      return character;
    return {
      ...character,
      name: '?'.repeat(character.name.length),
    };
  }

  async hideCharacterInListIfNeeded(
    character: Character,
    currentUserId: string | undefined,
    ownerId: string,
  ): Promise<Character> {
    const shouldHide =
      !(await this.shouldRevealSecrets()) && currentUserId !== ownerId;
    return {
      ...character,
      name: shouldHide ? '?'.repeat(character.name.length) : character.name,
    };
  }
}
