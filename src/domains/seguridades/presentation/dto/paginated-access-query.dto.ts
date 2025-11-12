import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginatedAccessQueryDto extends PaginationDto {
  @ApiProperty({ description: 'ID del usuario', example: 'uuid-del-usuario', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'userId debe ser un UUID válido' })
  userId?: string;

  @ApiProperty({ description: 'ID del rol', example: 'uuid-del-rol', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'roleId debe ser un UUID válido' })
  roleId?: string;

  @ApiProperty({ description: 'ID de la sucursal', example: 'uuid-de-sucursal', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'branchId debe ser un UUID válido' })
  branchId?: string;

  @ApiProperty({ 
    description: 'Estado del acceso (-1: Eliminado, 0: Inactivo, 1: Activo, 2: Pendiente, 3: Suspendido)', 
    example: 1, 
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'status debe ser un número entero' })
  status?: number;
}


