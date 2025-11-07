import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { PermissionType } from '../../infrastructure/entities/permission.entity';

/**
 * DTO para actualizar un permiso
 */
export class UpdatePermissionDto {
  @ApiProperty({ description: 'Nombre del permiso', example: 'Crear usuarios', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Tipo de permiso',
    enum: PermissionType,
    example: PermissionType.ACTION,
    required: false,
  })
  @IsOptional()
  @IsEnum(PermissionType, { message: 'El tipo de permiso debe ser PAGE o ACTION' })
  type?: PermissionType;

  @ApiProperty({ description: 'Recurso asociado', example: 'users', required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ description: 'Acción asociada', example: 'create', required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({ description: 'Ruta del frontend', example: '/users', required: false })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiProperty({ description: 'ID del item del menú', example: 'users', required: false })
  @IsOptional()
  @IsString()
  menuId?: string;

  @ApiProperty({
    description: 'Descripción del permiso',
    example: 'Permite crear nuevos usuarios',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Es permiso público', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: 'Permiso activo', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
