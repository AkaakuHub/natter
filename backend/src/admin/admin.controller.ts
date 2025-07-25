import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ToggleSecretsDto } from './dto/toggle-secrets.dto';
import { AuthenticatedRequest } from '../types/auth.types';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('status')
  async checkAdminStatus(@Request() req: AuthenticatedRequest) {
    const isAdmin = await this.adminService.checkAdminStatus(req.user.id);
    return { isAdmin };
  }

  @Get('settings')
  async getSettings(@Request() req: AuthenticatedRequest) {
    const isAdmin = await this.adminService.checkAdminStatus(req.user.id);

    if (!isAdmin) {
      throw new UnauthorizedException('Admin access required');
    }

    const settings = await this.adminService.getSettings();
    return settings;
  }

  @Post('toggle-secrets')
  async toggleSecrets(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ToggleSecretsDto,
  ) {
    const settings = await this.adminService.toggleRevealedSecrets(
      req.user.id,
      dto.isRevealedSecrets,
    );
    return settings;
  }
}
