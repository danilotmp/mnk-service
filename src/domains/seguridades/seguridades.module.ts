import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { MessagesModule } from '@/common/messages/messages.module';
import { SeguridadesController } from './presentation/controllers/seguridades.controller';
import { AuthService } from './application/services/auth.service';
import { UsuarioService } from './application/services/usuario.service';
import { AuthorizationService } from './application/services/authorization.service';
import { MenuService } from './application/services/menu.service';
import { RoleService } from './application/services/role.service';
import { PermissionService } from './application/services/permission.service';
import { AccessService } from './application/services/access.service';
import { UsuarioRepository } from './infrastructure/repositories/usuario.repository';
import { RoleRepository } from './infrastructure/repositories/role.repository';
import { PermissionRepository } from './infrastructure/repositories/permission.repository';
import { UserRoleRepository } from './infrastructure/repositories/user-role.repository';
import { MenuItemRepository } from './infrastructure/repositories/menu-item.repository';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { UsuarioEntity } from './infrastructure/entities/usuario.entity';
import { CompanyEntity } from './infrastructure/entities/company.entity';
import { BranchEntity } from './infrastructure/entities/branch.entity';
import { RoleEntity } from './infrastructure/entities/role.entity';
import { PermissionEntity } from './infrastructure/entities/permission.entity';
import { UserRoleEntity } from './infrastructure/entities/user-role.entity';
import { RolePermissionEntity } from './infrastructure/entities/role-permission.entity';
import { MenuItemEntity } from './infrastructure/entities/menu-item.entity';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { PermissionsGuard } from './infrastructure/guards/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioEntity,
      CompanyEntity,
      BranchEntity,
      RoleEntity,
      PermissionEntity,
      UserRoleEntity,
      RolePermissionEntity,
      MenuItemEntity,
    ]),
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
    MessagesModule, // Importar MessagesModule para tener acceso a ResponseHelper
  ],
  controllers: [SeguridadesController],
  providers: [
    AuthService,
    UsuarioService,
    AuthorizationService,
    MenuService,
    RoleService,
    PermissionService,
    AccessService,
    UsuarioRepository,
    RoleRepository,
    PermissionRepository,
    UserRoleRepository,
    MenuItemRepository,
    JwtStrategy,
    JwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [
    AuthService,
    UsuarioService,
    AuthorizationService,
    MenuService,
    RoleService,
    PermissionService,
    AccessService,
    JwtAuthGuard,
    PermissionsGuard,
  ],
})
export class SeguridadesModule {}

