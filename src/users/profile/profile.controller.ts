import { Controller, Get, Patch, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '@prisma/client';
import { GetUser } from '../../auth/decorator/get-user.decorator';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  getProfile(@GetUser() user: User) {
    console.log('User:', user);  
    
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  updateProfile(
    @GetUser('id') userId: number,
    @Body() updateData: UpdateProfileDto
  ) {
    return this.profileService.updateProfile(userId, updateData);
  }
}