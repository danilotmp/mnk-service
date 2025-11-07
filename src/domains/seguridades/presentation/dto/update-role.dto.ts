import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';

/**
 * DTO para actualizar un rol
 */
export class UpdateRoleDto {
  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ description: 'Nombre del rol (código único)', example: 'admin', required: false })
  @IsOptional()
  @IsString()
  name?: string;

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

  @ApiProperty({ description: 'Rol activo', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
