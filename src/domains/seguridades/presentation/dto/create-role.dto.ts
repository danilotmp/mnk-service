import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear un nuevo rol
 */
export class CreateRoleDto {
  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa' })
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de empresa es obligatorio' })
  companyId: string;

  @ApiProperty({ description: 'Código del rol (se guardará en mayúsculas)', example: 'ADMIN' })
  @IsString()
  @IsNotEmpty({ message: 'El código del rol es obligatorio' })
  code: string;

  @ApiProperty({ description: 'Nombre del rol para mostrar', example: 'Administrador' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
  name: string;

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
    required: false,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'status debe ser un número entero' })
  status?: number;

  @ApiProperty({
    description: 'Es rol del sistema',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSystem?: boolean;
}
