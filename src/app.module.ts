import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileService } from './users/profile/profile.service';
import { ProfileController } from './users/profile/profile.controller';
import { PreferencesService } from './users/preferences/preferences.service';
import { PreferencesController } from './users/preferences/preferences.controller';
import { TodosModule } from './todos/todos.module';
import { RedisModule } from './redis/redis.module';

console.log(process.env.JWT_SECRET);


@Module({
  imports: [AuthModule, PrismaModule, TodosModule, RedisModule],
  controllers: [AppController, ProfileController, PreferencesController],
  providers: [AppService, ProfileService, PreferencesService],
})
export class AppModule {}