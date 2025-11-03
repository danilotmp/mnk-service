import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { PermissionType } from '../../infrastructure/entities/permission.entity';

/**
 * DTO para filtros de búsqueda de permisos
 */
export class FilterPermissionDto {
  @ApiProperty({
    description: 'Tipo de permiso',
    enum: PermissionType,
    example: PermissionType.ACTION,
    required: false,
  })
  @IsOptional()
  @IsEnum(PermissionType, { message: 'El tipo de permiso debe ser PAGE o ACTION' })
  type?: PermissionType;

  @ApiProperty({ description: 'Permiso activo', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Término de búsqueda (busca en code, name y description)',
    example: 'users',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}

