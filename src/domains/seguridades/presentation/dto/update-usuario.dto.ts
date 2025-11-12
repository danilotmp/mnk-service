import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsUUID, IsInt } from 'class-validator';

/**
 * DTO para actualizar un usuario
 */
export class UpdateUsuarioDto {
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

  @ApiProperty({ description: 'Teléfono del usuario', example: '+593987654321', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ 
    description: 'Estado del registro: -1=Eliminado, 0=Inactivo, 1=Activo, 2=Pendiente', 
    example: 1, 
    required: false 
  })
  @IsOptional()
  @IsInt({ message: 'El status debe ser un número entero' })
  status?: number;
}
