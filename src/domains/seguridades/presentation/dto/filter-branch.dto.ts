import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';

/**
 * DTO para filtros de búsqueda de sucursales
 */
export class FilterBranchDto {
  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ description: 'Sucursal activa', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Término de búsqueda global (busca en código y nombre)',
    example: 'sucursal',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtro por código',
    example: 'SUC001',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Filtro por nombre',
    example: 'Sucursal Centro',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filtro por tipo',
    example: 'headquarters',
    enum: ['headquarters', 'branch', 'warehouse', 'store'],
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;
}


