import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { SeguridadesModule } from './domains/seguridades/seguridades.module';
import { DatabaseConfig } from './config/database.config';
import { envConfig } from './config/env.config';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { MultiCompanyMiddleware } from './common/middleware/multi-company.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      envFilePath: '.env',
    }),

    // Configuración de base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),

    // Módulos de dominio
    SeguridadesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MultiCompanyMiddleware).forRoutes('*');
  }
}

