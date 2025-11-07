import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsUUID, IsBoolean } from 'class-validator';

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

  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ description: 'Usuario activo', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
