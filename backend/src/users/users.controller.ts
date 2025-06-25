import { Controller, Get, Post, Body, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

export class CreateUserDto {
  twitterId: string;
  name: string;
  email?: string;
  image?: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get('twitter/:twitterId')
  async findByTwitterId(@Param('twitterId') twitterId: string) {
    console.log('Looking for user with Twitter ID:', twitterId);
    const user = await this.usersService.findByTwitterId(twitterId);
    console.log('Found user:', user);
    if (!user) {
      throw new NotFoundException(`User with Twitter ID ${twitterId} not found`);
    }
    return user;
  }
}