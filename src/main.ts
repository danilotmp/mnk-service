import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para desarrollo
  app.enableCors({
    origin: '*', // En producción, especificar dominios específicos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // ValidationPipe global para transformar y validar DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('MNK Service API')
    .setDescription('API Gateway para aplicación multiempresa MNK')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Seguridades', 'Módulo de autenticación y autorización')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}/api`);
  console.log(`📚 Swagger disponible en http://localhost:${port}/api/docs`);
}

bootstrap();

