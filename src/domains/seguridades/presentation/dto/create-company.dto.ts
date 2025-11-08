import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsString, IsObject } from 'class-validator';

/**
 * DTO para crear una empresa
 */
export class CreateCompanyDto {
  @ApiProperty({
    description: 'Código único de la empresa',
    example: 'COMP001',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Mi Empresa S.A.',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descripción de la empresa',
    example: 'Empresa de servicios tecnológicos',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Email de contacto de la empresa',
    example: 'contacto@miempresa.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Dirección de la empresa',
    example: { street: 'Calle Principal 123', city: 'Quito', country: 'Ecuador' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  address?: any;

  @ApiProperty({
    description: 'Configuraciones de la empresa',
    example: { timezone: 'America/Guayaquil', currency: 'USD' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: any;

  @ApiProperty({
    description: 'Plan de suscripción',
    example: { plan: 'premium', features: ['feature1', 'feature2'] },
    required: false,
  })
  @IsOptional()
  @IsObject()
  subscriptionPlan?: any;

  @ApiProperty({
    description: 'Estado activo de la empresa',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


