import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsUUID } from 'class-validator';

/**
 * DTO para registro de usuario
 */
export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'ContraseñaSegura123!',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'ID de la empresa',
    example: 'uuid-de-la-empresa',
  })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;
}

