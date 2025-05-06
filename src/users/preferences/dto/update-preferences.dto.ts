import { IsOptional, IsBoolean, IsIn } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: string;

  @IsOptional()
  @IsIn(['en', 'es', 'fr', 'de'])
  language?: string;

  @IsOptional()
  @IsBoolean()
  notifications?: boolean;
}