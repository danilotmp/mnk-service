import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, IsUUID, IsBoolean } from 'class-validator';
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
    description: 'Indica si el rol es del sistema',
    example: false,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
  })
  @IsBoolean({ message: 'isSystem debe ser un valor booleano' })
  isSystem?: boolean;

  @ApiProperty({
    description: 'Término de búsqueda (busca en code, name y description)',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}
