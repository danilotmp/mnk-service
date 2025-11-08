import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterAccessDto {
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

  @ApiProperty({ description: 'Acceso activo', example: true, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;
}





