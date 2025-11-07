import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthorizationService } from '../../application/services/authorization.service';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode, HttpStatusCode } from '@/common/messages/message-codes';

/**
 * Guard para verificar permisos de usuario
 * Protege endpoints según los permisos requeridos
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authorizationService: AuthorizationService,
    private responseHelper: ResponseHelper,
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

    const request = context.switchToHttp().getRequest();
    const lang = request.headers['accept-language'] || 'es';
    const user = request.user;

    if (!user || !user.userId) {
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.INSUFFICIENT_PERMISSIONS,
        lang,
        {
          reason: 'USER_NOT_AUTHENTICATED',
          route: request.originalUrl || request.url,
        },
        HttpStatusCode.FORBIDDEN,
      );
      throw new ForbiddenException(errorResponse);
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
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.INSUFFICIENT_PERMISSIONS,
        lang,
        {
          route: request.originalUrl || request.url,
          requiredPermissions: permissions,
          requireAll,
        },
        HttpStatusCode.FORBIDDEN,
      );
      throw new ForbiddenException(errorResponse);
    }

    return true;
  }
}
