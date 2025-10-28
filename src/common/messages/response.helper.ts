import { Injectable } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageCode, HttpStatusCode } from './message-codes';
import { ApiResponseDto } from '../dto/response.dto';

/**
 * Helper para crear respuestas estandarizadas con mensajes internacionalizados
 */
@Injectable()
export class ResponseHelper {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Crea una respuesta de éxito
   * @param data Datos de la respuesta
   * @param code Código del mensaje
   * @param lang Idioma
   * @param statusCode Código HTTP
   * @returns Respuesta estandarizada
   */
  async successResponse<T>(
    data: T,
    code: MessageCode,
    lang: string = 'es',
    statusCode: number = HttpStatusCode.OK,
  ): Promise<ApiResponseDto<T>> {
    const message = await this.messageService.getMessage(code, lang);

    return {
      data,
      result: {
        statusCode,
        description: message,
        details: null,
      },
    };
  }

  /**
   * Crea una respuesta de error
   * @param code Código del mensaje
   * @param lang Idioma
   * @param details Detalles técnicos del error
   * @param statusCode Código HTTP
   * @returns Respuesta de error estandarizada
   */
  async errorResponse(
    code: MessageCode,
    lang: string = 'es',
    details: any = null,
    statusCode: number = HttpStatusCode.BAD_REQUEST,
  ): Promise<ApiResponseDto> {
    const message = await this.messageService.getMessage(code, lang);

    return {
      data: null,
      result: {
        statusCode,
        description: message,
        details,
      },
    };
  }

  /**
   * Crea una respuesta de error con mensaje personalizado
   * @param message Mensaje personalizado
   * @param statusCode Código HTTP
   * @param details Detalles técnicos
   * @returns Respuesta de error
   */
  customErrorResponse(
    message: string,
    statusCode: number = HttpStatusCode.BAD_REQUEST,
    details: any = null,
  ): ApiResponseDto {
    return {
      data: null,
      result: {
        statusCode,
        description: message,
        details,
      },
    };
  }
}

