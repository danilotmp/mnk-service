import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbConfig = this.configService.get('database');

    if (dbConfig.type === 'sqlite') {
      return {
        type: 'sqlite',
        database: dbConfig.database,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: dbConfig.synchronize,
        logging: dbConfig.logging,
      };
    }

    // Configuración para PostgreSQL (futura migración a Azure)
    return {
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: dbConfig.synchronize,
      logging: dbConfig.logging,
    };
  }
}

