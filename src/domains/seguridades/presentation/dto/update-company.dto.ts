import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';

/**
 * DTO para actualizar una empresa
 * Todos los campos son opcionales
 */
export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}


