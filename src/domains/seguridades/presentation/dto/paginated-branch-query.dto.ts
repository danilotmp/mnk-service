import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, IsUUID } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

/**
 * DTO combinado para query parameters de sucursales con paginación y filtros
 */
export class PaginatedBranchQueryDto extends PaginationDto {
  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ 
    description: 'Estado de la sucursal (-1: Eliminada, 0: Inactiva, 1: Activa, 2: Pendiente, 3: Suspendida)', 
    example: 1, 
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'status debe ser un número entero' })
  status?: number;

  @ApiProperty({
    description: 'Término de búsqueda global (busca en código y nombre)',
    example: 'sucursal',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtro por código',
    example: 'SUC001',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Filtro por nombre',
    example: 'Sucursal Centro',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filtro por tipo',
    example: 'headquarters',
    enum: ['headquarters', 'branch', 'warehouse', 'store'],
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;
}


