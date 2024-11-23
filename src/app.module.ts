import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import loadConfig from 'config';
import { CdekService } from './cdek.service';
import { UpdateService } from './update.service';
import { DbService } from './db.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [loadConfig], isGlobal: true }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [CdekService, DbService, UpdateService],
})
export class AppModule {}
