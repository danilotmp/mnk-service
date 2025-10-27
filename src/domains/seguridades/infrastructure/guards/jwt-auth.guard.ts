import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

/**
 * Guard JWT que protege endpoints autenticados
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Aquí puedes agregar lógica adicional de autorización
    // Por ejemplo, verificar permisos, roles, etc.
    return super.canActivate(context);
  }
}

