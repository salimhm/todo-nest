import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PreferencesService {
  constructor(private prisma: PrismaService) {}

  async getPreferences(userId: number) {
    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId },
      create: { 
        userId,
        theme: 'light',
        language: 'en',
        notifications: true
      },
      update: {},
      include: {
        user: { select: { email: true } }
      }
    });

    return preferences;
  }

  async updatePreferences(userId: number, data: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  }) {
    try {
      return await this.prisma.userPreferences.update({
        where: { userId },
        data,
        include: {
          user: { select: { email: true } }
        }
      });
    } catch (error) {
      // Handle case where preferences don't exist
      if (error.code === 'P2025') {
        throw new NotFoundException('Preferences not found');
      }
      throw error;
    }
  }

  async initializePreferences(userId: number) {
    return this.prisma.userPreferences.create({
      data: {
        userId,
        theme: 'light',
        language: 'en',
        notifications: true
      }
    });
  }
}