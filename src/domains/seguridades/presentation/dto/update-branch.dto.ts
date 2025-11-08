import { PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';

/**
 * DTO para actualizar una sucursal
 * Todos los campos son opcionales
 */
export class UpdateBranchDto extends PartialType(CreateBranchDto) {}


