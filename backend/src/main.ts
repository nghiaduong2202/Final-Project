import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setVersion('1.0')
    .setTitle('Booking field sport - Docs API')
    .setDescription('Ứng dụng đặt sân thể thao online')
    .addServer('http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger-ui', app, document);

  app.enableCors({
    origin: [
      'https://capstoneprojectclient.vercel.app',
      'https://capstoneprojectadmin.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
