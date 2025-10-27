import { ApiProperty } from '@nestjs/swagger';

/**
 * Estructura estandarizada de respuesta para todas las APIs
 * 
 * Todas las respuestas del sistema deben seguir esta estructura
 * para mantener consistencia entre front y back
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Datos de la respuesta',
    example: {},
  })
  data: T;

  @ApiProperty({
    description: 'Resultado de la operación',
    example: {
      statusCode: 200,
      description: 'Operación exitosa',
      details: null,
    },
  })
  result: {
    statusCode: number;
    description: string;
    details: any;
  };
}

/**
 * Resultado estándar para operaciones
 */
export class Result {
  @ApiProperty({
    description: 'Código de estado HTTP',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Mensaje descriptivo para mostrar al usuario',
    example: 'Usuario autenticado correctamente',
  })
  description: string;

  @ApiProperty({
    description: 'Detalles técnicos del error (si aplica)',
    example: null,
  })
  details: any;
}

/**
 * Helper para crear respuestas exitosas
 */
export function createSuccessResponse<T>(data: T, description = 'Operación exitosa', statusCode = 200): ApiResponseDto<T> {
  return {
    data,
    result: {
      statusCode,
      description,
      details: null,
    },
  };
}

/**
 * Helper para crear respuestas de error
 */
export function createErrorResponse(
  description: string,
  details: any = null,
  statusCode = 400,
): ApiResponseDto {
  return {
    data: null,
    result: {
      statusCode,
      description,
      details,
    },
  };
}

