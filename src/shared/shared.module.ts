import { Module, Global } from '@nestjs/common';
import { CedulaValidator } from './validators/cedula.validator';
import { RucValidator } from './validators/ruc.validator';
import { IvaCalculator } from './calculators/iva.calculator';

/**
 * Módulo compartido
 * Contiene validaciones y utilidades comunes usadas por toda la aplicación
 */
@Global()
@Module({
  providers: [CedulaValidator, RucValidator, IvaCalculator],
  exports: [CedulaValidator, RucValidator, IvaCalculator],
})
export class SharedModule {}
