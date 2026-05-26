import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://plantgen.live'],
    credentials: true,
  });

  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  console.log(`✓ Backend running on http://localhost:${port}`);
}

bootstrap();
