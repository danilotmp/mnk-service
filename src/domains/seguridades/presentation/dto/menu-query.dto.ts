import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

/**
 * DTO para obtener el menú por rol
 */
export class MenuQueryDto {
  @ApiProperty({
    description: 'ID del rol del usuario autenticado',
    example: 'uuid-del-rol',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID del rol es obligatorio' })
  @IsUUID('4', { message: 'El ID del rol debe ser un UUID válido' })
  @IsString()
  roleId: string;
}
