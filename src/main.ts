import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import type { Config } from 'config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Config, true>);

  await app.listen(config.getOrThrow('port'));
}

bootstrap();
