import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

/**
 * DTO para paginación estándar
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  limit?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }
}

/**
 * Meta información de paginación para respuestas
 */
export class PaginationMeta {
  @ApiPropertyOptional()
  page: number;

  @ApiPropertyOptional()
  limit: number;

  @ApiPropertyOptional()
  total: number;

  @ApiPropertyOptional()
  totalPages: number;
}

