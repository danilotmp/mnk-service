import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para crear un nuevo rol
 */
export class CreateRoleDto {
  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa' })
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de empresa es obligatorio' })
  companyId: string;

  @ApiProperty({ description: 'Nombre del rol (código único)', example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
  name: string;

  @ApiProperty({ description: 'Nombre para mostrar', example: 'Administrador', required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Rol con permisos administrativos',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Rol activo', example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Es rol del sistema',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
