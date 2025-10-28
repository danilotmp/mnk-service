import { Injectable } from '@nestjs/common';

/**
 * Validador de cédula ecuatoriana
 */
@Injectable()
export class CedulaValidator {
  /**
   * Valida una cédula ecuatoriana
   * @param cedula Número de cédula a validar
   * @returns true si la cédula es válida
   */
  validate(cedula: string): boolean {
    if (!cedula || cedula.length !== 10) {
      return false;
    }

    // Verificar que todos los caracteres sean dígitos
    if (!/^\d+$/.test(cedula)) {
      return false;
    }

    const digitos = cedula.split('').map(Number);
    const tercerDigito = digitos[2];

    // Validar tercer dígito (provincia)
    if (tercerDigito < 0 || tercerDigito > 5) {
      return false;
    }

    // Algoritmo de validación
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let multiplier = i % 2 === 0 ? 2 : 1;
      let value = digitos[i] * multiplier;
      if (value >= 10) {
        value -= 9;
      }
      sum += value;
    }

    const checkDigit = (10 - (sum % 10)) % 10;

    return checkDigit === digitos[9];
  }

  /**
   * Formatea una cédula (elimina espacios, guiones, etc.)
   * @param cedula Cédula a formatear
   * @returns Cédula formateada
   */
  format(cedula: string): string {
    return cedula.trim().replace(/[\s-]/g, '');
  }

  /**
   * Genera una cédula de ejemplo (solo para testing)
   * @returns Cédula válida de ejemplo
   */
  generateExample(): string {
    return '1718123456';
  }
}

