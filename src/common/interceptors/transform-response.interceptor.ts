import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { createSuccessResponse, createErrorResponse } from '../dto/response.dto';
import { Result } from '../dto/response.dto';

/**
 * Interceptor global que transforma todas las respuestas
 * al formato estándar de la aplicación
 */
@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Si la respuesta ya tiene el formato correcto, retornarla tal cual
        if (data && data.result && data.result.statusCode !== undefined) {
          return data;
        }

        // Si es una respuesta de éxito sin formato, transformarla
        return createSuccessResponse(data);
      }),
      catchError((error) => {
        // Manejar errores HTTP
        if (error instanceof HttpException) {
          const response = error.getResponse();
          const status = error.getStatus();

          // Si el error ya tiene formato, retornarlo
          if (typeof response === 'object' && 'result' in response) {
            return throwError(() => error);
          }

          // Transformar error al formato estándar
          // Filtrar statusCode del details si existe
          const details =
            typeof response === 'object' && response !== null
              ? Object.fromEntries(Object.entries(response).filter(([key]) => key !== 'statusCode'))
              : response;

          const errorResponse = createErrorResponse(
            error.message || 'Error en la operación',
            details,
            status,
          );

          return throwError(() => new HttpException(errorResponse, status));
        }

        // Errores no esperados
        const errorResponse = createErrorResponse(
          'Error interno del servidor',
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        return throwError(() => new HttpException(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }
}

