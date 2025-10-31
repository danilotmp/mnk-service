import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthorizationService } from '../../application/services/authorization.service';

/**
 * Guard para verificar permisos de usuario
 * Protege endpoints según los permisos requeridos
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener permisos requeridos del decorador
    const requiredPermissions = this.reflector.getAllAndOverride<{
      permissions: string[];
      requireAll: boolean;
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // Si no hay permisos requeridos, permitir acceso
    if (!requiredPermissions || !requiredPermissions.permissions.length) {
      return true;
    }

    // Obtener usuario del request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar permisos
    const { permissions, requireAll } = requiredPermissions;
    let hasPermission = false;

    if (requireAll) {
      // Requiere TODOS los permisos
      hasPermission = await this.authorizationService.hasAllPermissions(user.userId, permissions);
    } else {
      // Requiere CUALQUIERA de los permisos
      hasPermission = await this.authorizationService.hasAnyPermission(user.userId, permissions);
    }

    if (!hasPermission) {
      throw new ForbiddenException('No tienes permisos suficientes para acceder a este recurso');
    }

    return true;
  }
}

