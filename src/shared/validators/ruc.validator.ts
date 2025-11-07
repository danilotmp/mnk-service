import { Injectable } from '@nestjs/common';

/**
 * Validador de RUC ecuatoriano
 */
@Injectable()
export class RucValidator {
  /**
   * Valida un RUC ecuatoriano
   * @param ruc Número de RUC a validar
   * @returns true si el RUC es válido
   */
  validate(ruc: string): boolean {
    if (!ruc || ruc.length !== 13) {
      return false;
    }

    // Verificar que todos los caracteres sean dígitos
    if (!/^\d+$/.test(ruc)) {
      return false;
    }

    // Los primeros dos dígitos deben estar entre 01 y 24 (provincias)
    const provincia = parseInt(ruc.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
      return false;
    }

    // El tercer dígito debe ser 9 (RUC persona jurídica) o menor a 6
    const tercerDigito = parseInt(ruc[2]);
    if (tercerDigito < 0 || tercerDigito > 6) {
      return false;
    }

    // Algoritmo de validación según el tipo
    if (tercerDigito < 6) {
      return this.validateRucNatural(ruc);
    } else {
      return this.validateRucJuridico(ruc);
    }
  }

  /**
   * Valida RUC de persona natural
   */
  private validateRucNatural(ruc: string): boolean {
    const digitos = ruc.split('').map(Number);

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const multiplier = i % 2 === 0 ? 2 : 1;
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
   * Valida RUC de persona jurídica
   */
  private validateRucJuridico(ruc: string): boolean {
    const digitos = ruc.split('').map(Number);

    const multipliers = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += digitos[i] * multipliers[i];
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;

    return checkDigit === digitos[9];
  }

  /**
   * Formatea un RUC (elimina espacios, guiones, etc.)
   * @param ruc RUC a formatear
   * @returns RUC formateado
   */
  format(ruc: string): string {
    return ruc.trim().replace(/[\s-]/g, '');
  }
}
