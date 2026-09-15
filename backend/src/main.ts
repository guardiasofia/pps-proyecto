import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(json({ limit: '8mb' }));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
