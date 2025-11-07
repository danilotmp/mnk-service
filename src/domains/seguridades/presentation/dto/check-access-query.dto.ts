import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckAccessQueryDto {
  @ApiProperty({ description: 'Ruta del frontend a validar', example: '/security/users' })
  @IsString()
  @IsNotEmpty()
  route: string;
} 