import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * Guard JWT que protege endpoints autenticados
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context) as Observable<boolean>;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Si hay un error o el usuario no está autenticado
    if (err || !user) {
      // Determinar el tipo de error
      let errorMessage = 'Token inválido o ausente';
      let errorDetails: any = { message: 'Unauthorized' };

      if (info) {
        if (info.name === 'TokenExpiredError') {
          errorMessage = 'Token expirado';
          errorDetails = { message: 'Token expired', expiredAt: info.expiredAt };
        } else if (info.name === 'JsonWebTokenError') {
          errorMessage = 'Token inválido';
          errorDetails = { message: 'Invalid token', error: info.message };
        } else if (info.name === 'NotBeforeError') {
          errorMessage = 'Token aún no válido';
          errorDetails = { message: 'Token not active', date: info.date };
        } else {
          errorDetails = { message: info.message || 'Unauthorized', info };
        }
      }

      // Lanzar excepción con formato estándar
      throw new UnauthorizedException({
        data: null,
        result: {
          statusCode: 401,
          description: errorMessage,
          details: errorDetails,
        },
      });
    }

    return user;
  }
}
