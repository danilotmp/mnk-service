import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { PermissionType } from '../../infrastructure/entities/permission.entity';

/**
 * DTO para crear un nuevo permiso
 */
export class CreatePermissionDto {
  @ApiProperty({ description: 'Código único del permiso', example: 'users.create' })
  @IsString()
  @IsNotEmpty({ message: 'El código del permiso es obligatorio' })
  code: string;

  @ApiProperty({ description: 'Nombre del permiso', example: 'Crear usuarios' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del permiso es obligatorio' })
  name: string;

  @ApiProperty({
    description: 'Tipo de permiso',
    enum: PermissionType,
    example: PermissionType.ACTION,
    required: false,
    default: PermissionType.PAGE,
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

  @ApiProperty({
    description: 'Es permiso público',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: 'Permiso activo', example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Es permiso del sistema',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
