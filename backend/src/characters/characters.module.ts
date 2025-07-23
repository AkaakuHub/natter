import { Module } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SecurityService } from '../services/security.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CharactersController],
  providers: [CharactersService, SecurityService],
  exports: [CharactersService],
})
export class CharactersModule {}
