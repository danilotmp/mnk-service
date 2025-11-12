import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
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

  @ApiProperty({ 
    description: 'Estado del permiso (-1: Eliminado, 0: Inactivo, 1: Activo, 2: Pendiente, 3: Suspendido)', 
    example: 1, 
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'status debe ser un número entero' })
  status?: number;

  @ApiProperty({
    description: 'Término de búsqueda (busca en code, name y description)',
    example: 'users.view',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}
