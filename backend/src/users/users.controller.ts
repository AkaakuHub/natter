import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  NotFoundException,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Request } from 'express';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  discordId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  image?: string | null;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string | null;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.findOrCreateByDiscordId(
      createUserDto.discordId,
      createUserDto.name,
      createUserDto.image,
    );
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  getRecommendedUsers(
    @Req() req: Request & { user?: { id: string } },
    @Query('limit') limit?: string,
  ) {
    const numLimit = limit ? parseInt(limit, 10) : 5;
    const excludeUserId = req?.user?.id;
    return this.usersService.getRecommendedUsers(numLimit, excludeUserId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      console.log(`🔍 [USER DETAIL] User ${id} not found`);
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get('discord/:discordId')
  async findByDiscordId(@Param('discordId') discordId: string) {
    const user = await this.usersService.findByDiscordId(discordId);
    if (!user) {
      throw new NotFoundException(
        `User with Discord ID ${discordId} not found`,
      );
    }
    return user;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }
}
