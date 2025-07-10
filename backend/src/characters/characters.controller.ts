import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  // ユーザーのキャラクター一覧を取得
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Query('userId') userId?: string,
    @Request() req?: ExpressRequest,
  ) {
    const currentUserId = req?.user?.id;
    // 特定のユーザーのキャラクターを取得する場合
    if (userId) {
      return this.charactersService.findAllByUser(userId, currentUserId);
    }
    // 自分のキャラクターを取得する場合（認証が必要）
    if (!currentUserId) {
      return [];
    }
    return this.charactersService.findAllByUser(currentUserId, currentUserId);
  }

  // 名前でキャラクターを検索（オートコンプリート用）
  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(@Query('query') query: string, @Request() req: ExpressRequest) {
    if (!query) {
      return [];
    }
    return this.charactersService.searchByName(query, req.user?.id || '');
  }

  // 特定のキャラクターを取得
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    return this.charactersService.findOne(id, req.user?.id || '');
  }

  // キャラクターを作成
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(ValidationPipe) createCharacterDto: CreateCharacterDto,
    @Request() req: ExpressRequest,
  ) {
    return this.charactersService.create(
      createCharacterDto,
      req.user?.id || '',
    );
  }

  // キャラクターを更新
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateCharacterDto: UpdateCharacterDto,
    @Request() req: ExpressRequest,
  ) {
    return this.charactersService.update(
      id,
      updateCharacterDto,
      req.user?.id || '',
    );
  }

  // キャラクターを削除
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    return this.charactersService.remove(id, req.user?.id || '');
  }
}
