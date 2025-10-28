import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { ResponseHelper } from './response.helper';

/**
 * Módulo de mensajes
 * Proporciona servicios para mensajes internacionalizados
 */
@Module({
  providers: [MessageService, ResponseHelper],
  exports: [MessageService, ResponseHelper],
})
export class MessagesModule {}

