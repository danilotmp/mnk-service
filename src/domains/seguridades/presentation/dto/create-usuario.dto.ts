import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsUUID,
  IsArray,
  IsNumber,
  IsInt,
} from 'class-validator';

/**
 * DTO para crear un nuevo usuario
 */
export class CreateUsuarioDto {
  @ApiProperty({ description: 'Email del usuario', example: 'usuario@example.com' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'Password123!', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName: string;

  @ApiProperty({ description: 'Teléfono del usuario', example: '+593987654321', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa' })
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de empresa es obligatorio' })
  companyId: string;

  @ApiProperty({ 
    description: 'Estado del registro: -1=Eliminado, 0=Inactivo, 1=Activo, 2=Pendiente', 
    example: 1, 
    required: false, 
    default: 1 
  })
  @IsOptional()
  @IsInt({ message: 'El status debe ser un número entero' })
  status?: number;

  @ApiProperty({
    description: 'ID del rol principal a asignar al usuario',
    example: 'uuid-del-rol',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El roleId debe ser un UUID válido' })
  roleId?: string;

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
