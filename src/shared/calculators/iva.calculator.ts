import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Calculadora de IVA
 * Maneja cálculos de impuestos de forma centralizada
 */
@Injectable()
export class IvaCalculator {
  private readonly defaultIVA = 12; // 12% por defecto

  constructor(private readonly configService: ConfigService) {}

  /**
   * Calcula el IVA de un subtotal
   * @param subtotal Monto sin IVA
   * @param companyCode Código de la empresa
   * @returns Monto de IVA
   */
  calculateIVA(subtotal: number, companyCode?: string): number {
    const ivaPercentage = this.getIVAPercentage(companyCode);
    return subtotal * (ivaPercentage / 100);
  }

  /**
   * Calcula el total con IVA
   * @param subtotal Monto sin IVA
   * @param companyCode Código de la empresa
   * @returns Total con IVA
   */
  calculateTotalWithIVA(subtotal: number, companyCode?: string): number {
    return subtotal + this.calculateIVA(subtotal, companyCode);
  }

  /**
   * Obtiene el subtotal de un total que incluye IVA
   * @param total Monto con IVA
   * @param companyCode Código de la empresa
   * @returns Subtotal sin IVA
   */
  getSubtotalFromTotal(total: number, companyCode?: string): number {
    const ivaPercentage = this.getIVAPercentage(companyCode);
    return total / (1 + ivaPercentage / 100);
  }

  /**
   * Obtiene el IVA desde un total que incluye IVA
   * @param total Monto con IVA
   * @param companyCode Código de la empresa
   * @returns Monto de IVA
   */
  getIVAFromTotal(total: number, companyCode?: string): number {
    const subtotal = this.getSubtotalFromTotal(total, companyCode);
    return total - subtotal;
  }

  /**
   * Obtiene el porcentaje de IVA
   * @param companyCode Código de la empresa
   * @returns Porcentaje de IVA
   */
  getIVAPercentage(companyCode?: string): number {
    if (companyCode) {
      return (
        this.configService.get(`taxes.${companyCode}.iva`) || this.defaultIVA
      );
    }
    return this.defaultIVA;
  }

  /**
   * Formatea un valor monetario
   * @param amount Monto a formatear
   * @param currency Moneda
   * @returns Monto formateado
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

