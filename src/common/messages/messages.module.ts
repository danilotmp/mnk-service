import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { ResponseHelper } from './response.helper';
import { RecordStatusHelper } from '../helpers/record-status.helper';

/**
 * Módulo de mensajes
 * Proporciona servicios para mensajes internacionalizados y helpers
 */
@Module({
  providers: [MessageService, ResponseHelper, RecordStatusHelper],
  exports: [MessageService, ResponseHelper, RecordStatusHelper],
})
export class MessagesModule {}

