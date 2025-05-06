import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    console.log('Fetching profile for user ID:', userId);
    
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        avatar: true,
        phone: true,
        preferences: true
      }
    });
  }

  async updateProfile(userId: number, data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
    phone?: string;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        avatar: true,
        phone: true
      }
    });
  }
}