import { Controller, Post, Body } from '@nestjs/common';
import { ServerService } from './server.service';
import { CheckServerDto } from './dto/check-server.dto';

@Controller()
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post('check-server')
  checkServer(@Body() checkServerDto: CheckServerDto) {
    return this.serverService.checkServer(checkServerDto);
  }
}
