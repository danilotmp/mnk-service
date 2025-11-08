import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

/**
 * DTO combinado para query parameters de empresas con paginación y filtros
 */
export class PaginatedCompanyQueryDto extends PaginationDto {
  @ApiProperty({ description: 'Empresa activa', example: true, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
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


