import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async checkAdminStatus(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    return user?.isAdmin || false;
  }

  async getSettings() {
    let settings = await this.prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          id: 1,
          isRevealedSecrets: false,
        },
      });
    }

    return settings;
  }

  async toggleRevealedSecrets(userId: string, isRevealedSecrets: boolean) {
    const isAdmin = await this.checkAdminStatus(userId);

    if (!isAdmin) {
      throw new UnauthorizedException('Only admins can change this setting');
    }

    const settings = await this.prisma.settings.update({
      where: { id: 1 },
      data: { isRevealedSecrets },
    });

    return settings;
  }

  async isRevealedSecretsEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.isRevealedSecrets;
  }
}
