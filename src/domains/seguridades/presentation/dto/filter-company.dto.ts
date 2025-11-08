import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

/**
 * DTO para filtros de búsqueda de empresas
 */
export class FilterCompanyDto {
  @ApiProperty({ description: 'Empresa activa', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Término de búsqueda global (busca en código, nombre y email)',
    example: 'empresa',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtro por código',
    example: 'COMP001',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Filtro por nombre',
    example: 'Mi Empresa',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filtro por email',
    example: 'contacto@empresa.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;
}


