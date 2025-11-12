import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

/**
 * DTO combinado para query parameters de empresas con paginación y filtros
 */
export class PaginatedCompanyQueryDto extends PaginationDto {
  @ApiProperty({ 
    description: 'Estado de la empresa (-1: Eliminada, 0: Inactiva, 1: Activa, 2: Pendiente, 3: Suspendida)', 
    example: 1, 
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'status debe ser un número entero' })
  status?: number;

  @ApiProperty({
    description: 'Término de búsqueda global (busca en código, nombre y email)',
    example: 'empresa',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtro por código',
    example: 'COMP001',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Filtro por nombre',
    example: 'Mi Empresa',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filtro por email',
    example: 'contacto@empresa.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;
}


