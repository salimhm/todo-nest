import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }
    async register(dto: RegisterDTO) {
        if (!dto) {
            throw new UnauthorizedException('User data is required');
        }
        const { firstName, lastName, email, password } = dto;
        if (!email || !password) {
            throw new UnauthorizedException('Email and password are required');
        }
        if (!firstName || !lastName) {
            throw new UnauthorizedException('First name and last name are required');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }
        // console.log('Registering user:', dto);

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword
            }
        })

        return this.generateToken(user.id, user.email);
    }

    async generateToken(userId: number, email: string) {
        const accessTokenPayload = {
            sub: userId,
            email: email,
            type: 'access'
        }

        const refreshTokenPayload = {
            sub: userId,
            email: email,
            type: 'refresh'
        }

        const access_token = this.jwtService.sign(accessTokenPayload);
        const refreshToken = this.jwtService.sign(refreshTokenPayload, {
            expiresIn: '7d'
        })

        await this.prisma.refreshToken.create({
            data: {
                userId: userId,
                token: await bcrypt.hash(refreshToken, 10),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                isRevoked: false
            }
        })

        return {
            access_token: access_token,
            refresh_token: refreshToken,
            expires_in: 3600
        };
    }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(dto: LoginDTO) {
        const { email, password } = dto;
        if (!email || !password) {
            throw new UnauthorizedException('Email and password are required');
        }
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.generateToken(user.id, user.email);
    }
}
