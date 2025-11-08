import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsUUID, IsBoolean, IsArray } from 'class-validator';

/**
 * DTO para actualización completa de un usuario
 * Incluye datos básicos + roles + sucursales
 * 
 * Uso: Ideal para formularios de edición que manejan todo en una sola petición
 */
export class UpdateUsuarioCompletoDto {
  // ============================================
  // DATOS BÁSICOS DEL USUARIO
  // ============================================

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Password123!',
    required: false,
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ description: 'Usuario activo', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // ============================================
  // GESTIÓN DE ROLES
  // ============================================

  @ApiProperty({
    description: 'ID del rol principal a asignar al usuario',
    example: 'uuid-del-rol',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El roleId debe ser un UUID válido' })
  roleId?: string;

  // ============================================
  // GESTIÓN DE SUCURSALES
  // ============================================

  @ApiProperty({
    description: 'Array de IDs de sucursales a las que el usuario tiene acceso',
    example: ['uuid-sucursal-1', 'uuid-sucursal-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'branchIds debe ser un array' })
  @IsUUID('4', { each: true, message: 'Cada branchId debe ser un UUID válido' })
  branchIds?: string[];
}


