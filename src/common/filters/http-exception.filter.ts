import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { createErrorResponse } from '../dto/response.dto';

/**
 * Filtro global de excepciones HTTP
 * Garantiza que todas las respuestas de error sigan el formato estándar
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && 'result' in exceptionResponse) {
        // Ya tiene el formato correcto
        return response.status(status).json(exceptionResponse);
      }

      message = exception.message || 'Ha ocurrido un error';
      // Filtrar statusCode del details si existe
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        details = Object.fromEntries(
          Object.entries(exceptionResponse).filter(([key]) => key !== 'statusCode'),
        );
      } else {
        details = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = exception.stack;
    }

    const errorResponse = createErrorResponse(message, details, status);

    console.error('Error capturado:', {
      status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    response.status(status).json(errorResponse);
  }
}

