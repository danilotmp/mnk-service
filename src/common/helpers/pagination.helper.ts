import { PaginationDto } from '../dto/pagination.dto';
import { PaginationMeta, PaginatedResponse } from '../dto/pagination.dto';

/**
 * Helper para calcular metadata de paginación
 */
export class PaginationHelper {
  /**
   * Calcula la metadata de paginación
   */
  static calculateMeta(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Calcula el offset (skip) basado en la página y límite
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Normaliza los parámetros de paginación
   */
  static normalizeParams(paginationDto: PaginationDto): {
    page: number;
    limit: number;
    skip: number;
  } {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = this.calculateOffset(page, limit);

    return { page, limit, skip };
  }

  /**
   * Crea una respuesta paginada estandarizada
   */
  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    return {
      data,
      meta: this.calculateMeta(page, limit, total),
    };
  }
}

