import { Controller, Get, Patch, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../auth/decorator/get-user.decorator';
import { PreferencesService } from './preferences.service';

@Controller('preferences')
@UseGuards(AuthGuard('jwt'))
export class PreferencesController {
  constructor(private preferencesService: PreferencesService) {}

  @Get()
  getPreferences(@GetUser('id') userId: number) {
    return this.preferencesService.getPreferences(userId);
  }

  @Patch()
  updatePreferences(
    @GetUser('id') userId: number,
    @Body() updateData: any
  ) {
    return this.preferencesService.updatePreferences(userId, updateData);
  }
}