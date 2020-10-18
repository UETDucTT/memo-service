import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import prometheusMiddleware from 'prometheus-api-metrics';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: true,
      whitelist: true,
      transform: true,
    }),
  );

  app.use(
    prometheusMiddleware({
      durationBuckets: [0.1, 0.5, 1, 1.5],
      metricsPrefix: 'teko',
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Memo Service')
    .setDescription('Memo Service API Description')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'Authorization',
    )
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
