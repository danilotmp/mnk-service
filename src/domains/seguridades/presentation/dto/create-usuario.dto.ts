import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsUUID,
  IsBoolean,
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

  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa' })
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de empresa es obligatorio' })
  companyId: string;

  @ApiProperty({ description: 'Usuario activo', example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
