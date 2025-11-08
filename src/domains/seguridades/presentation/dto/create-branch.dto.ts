import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsBoolean, IsString, IsObject, IsUUID } from 'class-validator';

/**
 * DTO para crear una sucursal
 */
export class CreateBranchDto {
  @ApiProperty({
    description: 'ID de la empresa',
    example: 'uuid-de-la-empresa',
  })
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'Código único de la sucursal',
    example: 'SUC001',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Centro',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Tipo de sucursal',
    example: 'headquarters',
    enum: ['headquarters', 'branch', 'warehouse', 'store'],
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Dirección de la sucursal',
    example: { street: 'Av. Principal 456', city: 'Guayaquil', country: 'Ecuador' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  address?: any;

  @ApiProperty({
    description: 'Información de contacto',
    example: { phone: '0987654321', email: 'sucursal@empresa.com' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  contactInfo?: any;

  @ApiProperty({
    description: 'Configuraciones de la sucursal',
    example: { openHours: '08:00-18:00', maxCapacity: 100 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: any;

  @ApiProperty({
    description: 'Estado activo de la sucursal',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


