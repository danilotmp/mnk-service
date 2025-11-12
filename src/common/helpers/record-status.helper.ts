import { Injectable } from '@nestjs/common';
import { MessageService } from '../messages/message.service';
import { RecordStatus } from '../enums/record-status.enum';
import { MessageCode } from '../messages/message-codes';

/**
 * Helper para formatear estados de registro con sus traducciones
 */
@Injectable()
export class RecordStatusHelper {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Obtiene la descripción traducida de un RecordStatus
   */
  async getDescription(status: RecordStatus, lang: string = 'es'): Promise<string> {
    const messageCode = this.getMessageCode(status);
    return await this.messageService.getMessage(messageCode as MessageCode, lang);
  }

  /**
   * Mapea el enum a su código de traducción
   */
  private getMessageCode(status: RecordStatus): string {
    const statusMap = {
      [RecordStatus.DELETED]: 'RECORD_STATUS_DELETED',
      [RecordStatus.INACTIVE]: 'RECORD_STATUS_INACTIVE',
      [RecordStatus.ACTIVE]: 'RECORD_STATUS_ACTIVE',
      [RecordStatus.PENDING]: 'RECORD_STATUS_PENDING',
      [RecordStatus.SUSPENDED]: 'RECORD_STATUS_SUSPENDED',
    };
    return statusMap[status] || 'RECORD_STATUS_ACTIVE';
  }

  /**
   * Formatea un objeto con status y su descripción
   */
  async format(status: RecordStatus, lang: string = 'es') {
    return {
      status,
      statusDescription: await this.getDescription(status, lang),
    };
  }

  /**
   * Valida si un status es válido
   */
  isValid(status: number): boolean {
    return Object.values(RecordStatus).includes(status);
  }

  /**
   * Valida si un registro está activo
   */
  isActive(status: RecordStatus): boolean {
    return status === RecordStatus.ACTIVE;
  }

  /**
   * Valida si un registro está eliminado
   */
  isDeleted(status: RecordStatus): boolean {
    return status === RecordStatus.DELETED;
  }
}

