import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { SeguridadesController } from './presentation/controllers/seguridades.controller';
import { UsuarioController } from './presentation/controllers/usuario.controller';
import { AuthService } from './application/services/auth.service';
import { UsuarioService } from './application/services/usuario.service';
import { UsuarioRepository } from './infrastructure/repositories/usuario.repository';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { UsuarioEntity } from './infrastructure/entities/usuario.entity';
import { CompanyEntity } from './infrastructure/entities/company.entity';
import { BranchEntity } from './infrastructure/entities/branch.entity';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioEntity, CompanyEntity, BranchEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
    }),
  ],
  controllers: [SeguridadesController, UsuarioController],
  providers: [
    AuthService,
    UsuarioService,
    UsuarioRepository,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, UsuarioService, JwtAuthGuard],
})
export class SeguridadesModule {}

