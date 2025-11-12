import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, IsUUID } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

/**
 * DTO combinado para query parameters de roles con paginación y filtros
 */
export class PaginatedRoleQueryDto extends PaginationDto {
  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ 
    description: 'Estado del rol (-1: Eliminado, 0: Inactivo, 1: Activo, 2: Pendiente, 3: Suspendido)', 
    example: 1, 
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'status debe ser un número entero' })
  status?: number;

  @ApiProperty({
    description: 'Término de búsqueda (busca en name, displayName y description)',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}
