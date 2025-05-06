import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { NIL } from 'uuid';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw error when no data provided', async () => {
      await expect(service.register({} as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error when email or password missing', async () => {
      const dto = { firstName: 'John', lastName: 'Doe' };
      await expect(service.register(dto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error when user already exists', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password',
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({} as any);
      await expect(service.register(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should register a new user', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password',
      };
      const hashedPassword = 'hashedPassword';
      const user = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'hashedPassword',
        bio: null,
        avatar: null,
        phone: null,
        createdAt: new Date(),
      };


      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(user);
      jest.spyOn(service, 'generateToken').mockResolvedValue({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
      });

      const result = await service.register(dto);
      expect(result).toHaveProperty('access_token');
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw error when credentials are invalid', async () => {
      const dto = { email: 'test@example.com', password: 'wrong' };
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens when credentials are valid', async () => {
      const dto = { email: 'test@example.com', password: 'correct' };
      const user = { id: 1, email: dto.email, password: 'hashed' };

      jest.spyOn(service, 'validateUser').mockResolvedValue(user as any);
      jest.spyOn(service, 'generateToken').mockResolvedValue({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
      });

      const result = await service.login(dto);
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('generateToken', () => {
    it('should generate access and refresh tokens', async () => {
      const userId = 1;
      const email = 'test@example.com';

      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('accessToken');
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('refreshToken');
      jest.spyOn(prisma.refreshToken, 'create').mockResolvedValue({} as any);

      const result = await service.generateToken(userId, email);
      expect(result).toEqual({
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
        expires_in: 3600,
      });
    });
  });
});