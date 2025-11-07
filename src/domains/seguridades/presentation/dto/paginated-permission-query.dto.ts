import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PermissionType } from '../../infrastructure/entities/permission.entity';

/**
 * DTO combinado para query parameters de permisos con paginación y filtros
 */
export class PaginatedPermissionQueryDto extends PaginationDto {
  @ApiProperty({
    description: 'Tipo de permiso',
    enum: PermissionType,
    example: PermissionType.PAGE,
    required: false,
  })
  @IsOptional()
  @IsEnum(PermissionType, { message: 'El tipo de permiso debe ser PAGE o ACTION' })
  type?: PermissionType;

  @ApiProperty({ description: 'Permiso activo', example: true, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Término de búsqueda (busca en code, name y description)',
    example: 'users.view',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}
