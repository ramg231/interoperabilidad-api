import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configuracion = new DocumentBuilder()
    .setTitle('API de Interoperabilidad de La Punta')
    .setDescription(
      'Servicios de consulta de Predios y Licencias. ' +
      'Requieren credenciales válidas, IP autorizada ' +
      'y permiso para el servicio.',
    )
    .setVersion('1.0.0')
    .addBasicAuth()
    .build();

  const documento = SwaggerModule.createDocument(
    app,
    configuracion,
  );

  SwaggerModule.setup('docs', app, documento, {
    swaggerOptions: {
      persistAuthorization: false,
    },
  });

  app.enableShutdownHooks();

  await app.listen(3000);
}

bootstrap();