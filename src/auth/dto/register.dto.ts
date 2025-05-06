import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDTO {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}