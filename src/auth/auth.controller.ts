import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDTO) {
        const user = await this.authService.register(dto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Registration successful',
            data: user
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDTO) {
        const tokens = await this.authService.login(dto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Login successful',
            data: tokens
        };
    }
}
