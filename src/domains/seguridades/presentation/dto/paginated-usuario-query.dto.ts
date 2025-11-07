import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

/**
 * DTO combinado para query parameters de usuarios con paginación y filtros
 */
export class PaginatedUsuarioQueryDto extends PaginationDto {
  @ApiProperty({ description: 'ID de la empresa', example: 'uuid-de-empresa', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de empresa debe ser un UUID válido' })
  companyId?: string;

  @ApiProperty({ description: 'Usuario activo', example: true, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Término de búsqueda global (busca en email, nombre y apellido)',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Término de búsqueda (alias de search, deprecado)',
    example: 'juan',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({
    description: 'Filtro por email',
    example: 'usuario@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Filtro por nombre',
    example: 'Juan',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Filtro por apellido',
    example: 'Pérez',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}
