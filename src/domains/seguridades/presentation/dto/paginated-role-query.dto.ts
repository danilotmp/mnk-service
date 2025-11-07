import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

/**
 * DTO combinado para query parameters de roles con paginación y filtros
 */
export class PaginatedRoleQueryDto extends PaginationDto {
  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ description: 'Rol activo', example: true, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Término de búsqueda (busca en name, displayName y description)',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}
