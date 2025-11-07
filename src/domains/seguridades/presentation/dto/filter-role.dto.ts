import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';

/**
 * DTO para filtros de búsqueda de roles
 */
export class FilterRoleDto {
  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ description: 'Rol activo', example: true, required: false })
  @IsOptional()
  @IsBoolean()
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
