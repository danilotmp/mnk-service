import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { I18nModule, I18nJsonLoader, AcceptLanguageResolver } from 'nestjs-i18n';
import { SeguridadesModule } from './domains/seguridades/seguridades.module';
import { SharedModule } from './shared/shared.module';
import { MessagesModule } from './common/messages/messages.module';
import { DatabaseConfig } from './config/database.config';
import { envConfig } from './config/env.config';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { MultiCompanyMiddleware } from './common/middleware/multi-company.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      envFilePath: '.env',
    }),

    // Configuración de i18n (multilenguaje)
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: join(process.cwd(), 'src/common/messages/i18n/locales'),
        watch: process.env.NODE_ENV === 'development',
      },
      resolvers: [AcceptLanguageResolver],
    }),

    // Configuración de base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),

    // Módulo compartido (validaciones y utilidades)
    SharedModule,

    // Módulo de mensajes (i18n)
    MessagesModule,

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

