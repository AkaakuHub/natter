import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ServerService } from './server.service';
import { CheckServerDto } from './dto/check-server.dto';
import { PasskeyGuard } from '../auth/auth.guard';

@Controller()
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post('check-server')
  @UseGuards(PasskeyGuard)
  checkServer(@Body() checkServerDto: CheckServerDto) {
    return this.serverService.checkServer(checkServerDto);
  }
}