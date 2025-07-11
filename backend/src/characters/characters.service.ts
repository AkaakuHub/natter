import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CharactersService {
  constructor(private prisma: PrismaService) {}

  // ユーザーのキャラクター一覧を取得（投稿数付き）
  async findAllByUser(userId: string, currentUserId?: string) {
    const characters = await this.prisma.character.findMany({
      where: { userId },
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return characters.map((character) => {
      // 自分のキャラクターの場合は実名を表示、他人のキャラクターは文字数分の「?」で隠蔽
      const shouldHide = currentUserId !== userId;
      return {
        ...character,
        name: shouldHide ? '?'.repeat(character.name.length) : character.name,
        postsCount: character.postsCount, // DBのpostsCountフィールドを使用
      };
    });
  }

  // 特定のキャラクターを取得
  async findOne(id: number, userId: string) {
    const character = await this.prisma.character.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return {
      ...character,
      postsCount: character.postsCount, // DBのpostsCountフィールドを使用
    };
  }

  // キャラクターを作成
  async create(createCharacterDto: CreateCharacterDto, userId: string) {
    try {
      const character = await this.prisma.character.create({
        data: {
          ...createCharacterDto,
          userId,
        },
        include: {
          _count: {
            select: { posts: true },
          },
        },
      });

      return {
        ...character,
        postsCount: character.postsCount, // DBのpostsCountフィールドを使用
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Character name already exists');
      }
      throw error;
    }
  }

  // キャラクターを更新
  async update(
    id: number,
    updateCharacterDto: UpdateCharacterDto,
    userId: string,
  ) {
    // 存在チェック
    const existingCharacter = await this.prisma.character.findFirst({
      where: { id, userId },
    });

    if (!existingCharacter) {
      throw new NotFoundException('Character not found');
    }

    try {
      const character = await this.prisma.character.update({
        where: { id },
        data: updateCharacterDto,
        include: {
          _count: {
            select: { posts: true },
          },
        },
      });

      return {
        ...character,
        postsCount: character.postsCount, // DBのpostsCountフィールドを使用
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Character name already exists');
      }
      throw error;
    }
  }

  // キャラクターを削除
  async remove(id: number, userId: string) {
    // 存在チェック
    const existingCharacter = await this.prisma.character.findFirst({
      where: { id, userId },
    });

    if (!existingCharacter) {
      throw new NotFoundException('Character not found');
    }

    // 関連する投稿のcharacterIdをnullにして削除
    await this.prisma.post.updateMany({
      where: { characterId: id },
      data: { characterId: null },
    });

    // キャラクターを削除
    await this.prisma.character.delete({
      where: { id },
    });

    return { message: 'Character deleted successfully' };
  }

  // 名前でキャラクターを検索（オートコンプリート用）
  async searchByName(query: string, userId: string) {
    const characters = await this.prisma.character.findMany({
      where: {
        userId,
        name: {
          contains: query,
        },
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return characters.map((character) => ({
      ...character,
      postsCount: character.postsCount, // DBのpostsCountフィールドを使用
    }));
  }
}
