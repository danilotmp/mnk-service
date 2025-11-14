import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para actualizar un rol
 */
export class UpdateRoleDto {
  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ description: 'Código del rol (se guardará en mayúsculas)', example: 'ADMIN', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Nombre del rol para mostrar', example: 'Administrador', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Rol con permisos administrativos',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

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
    description: 'Es rol del sistema (no se puede eliminar)',
    example: false,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isSystem debe ser un valor booleano' })
  isSystem?: boolean;
}
