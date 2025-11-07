import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MessageCode } from './message-codes';

/**
 * Servicio para obtener mensajes internacionalizados
 * Centraliza la obtención de mensajes en diferentes idiomas
 */
@Injectable()
export class MessageService {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Obtiene un mensaje en el idioma especificado
   * @param code Código del mensaje
   * @param lang Idioma (es, en, pt)
   * @returns Mensaje traducido
   */
  async getMessage(code: MessageCode, lang: string = 'es'): Promise<string> {
    try {
      // Intentar obtener del JSON de errores
      const errorMessage = await this.i18n.translate(`errors.${code}`, {
        lang,
      });

      // Si existe y es un string válido, devolverlo
      if (errorMessage && typeof errorMessage === 'string' && errorMessage !== `errors.${code}`) {
        return errorMessage;
      }

      // Intentar obtener del JSON de success
      const successMessage = await this.i18n.translate(`success.${code}`, {
        lang,
      });

      // Si existe y es un string válido, devolverlo
      if (
        successMessage &&
        typeof successMessage === 'string' &&
        successMessage !== `success.${code}`
      ) {
        return successMessage;
      }

      // Si no se encontró, devolver el código
      return code;
    } catch (error) {
      return code;
    }
  }

  /**
   * Obtiene el tipo de mensaje basado en el código
   * @param code Código del mensaje
   * @returns Tipo de mensaje ('error' si está en errors, 'success' si está en success)
   */
  getMessageTypeFromCode(code: MessageCode): string {
    // Determinar tipo basándose en el contexto donde se usa
    // Este método es simple y determina el tipo por el contexto
    return code.includes('_ERROR') || code.includes('ERROR') ? 'error' : 'success';
  }
}

