import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BranchRepository } from '../../infrastructure/repositories/branch.repository';
import { ResponseHelper } from '@/common/messages/response.helper';
import { RecordStatusHelper } from '@/common/helpers/record-status.helper';
import { RecordStatus } from '@/common/enums/record-status.enum';
import { MessageCode } from '@/common/messages/message-codes';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginationHelper } from '@/common/helpers/pagination.helper';

/**
 * Service de gestión de sucursales
 */
@Injectable()
export class BranchService {
  constructor(
    private branchRepository: BranchRepository,
    private responseHelper: ResponseHelper,
    private recordStatusHelper: RecordStatusHelper,
  ) {}

  private async formatBranchWithStatus(branch: any, lang: string = 'es') {
    return { ...branch, ...(await this.recordStatusHelper.format(branch.status, lang)) };
  }

  /**
   * Obtener todas las sucursales (sin paginación)
   */
  async findAll(lang: string = 'es') {
    const branches = await this.branchRepository.findAll();
    const formatted = await Promise.all(branches.map(b => this.formatBranchWithStatus(b, lang)));
    return await this.responseHelper.successResponse(formatted, MessageCode.SUCCESS, lang);
  }

  /**
   * Obtener sucursales por empresa
   */
  async findByCompany(companyId: string, lang: string = 'es') {
    const branches = await this.branchRepository.findByCompany(companyId);
    return await this.responseHelper.successResponse(
      branches,
      MessageCode.SUCCESS,
      lang,
    );
  }

  /**
   * Obtener sucursales con paginación
   */
  async findPaginated(
    paginationDto: PaginationDto,
    filters?: { 
      companyId?: string;
      isActive?: boolean;
      search?: string;
      code?: string;
      name?: string;
      type?: string;
    },
    lang: string = 'es',
  ) {
    const { page, limit, skip } = PaginationHelper.normalizeParams(paginationDto);

    // Aplicar filtros si se proporciona alguno
    const hasFilters = filters && (
      filters.search || 
      filters.companyId ||
      filters.isActive !== undefined ||
      filters.code ||
      filters.name ||
      filters.type
    );

    const [branches, total] = hasFilters
      ? await this.branchRepository.searchWithPagination(skip, limit, filters)
      : await this.branchRepository.findWithPagination(skip, limit);

    const formatted = await Promise.all(branches.map(b => this.formatBranchWithStatus(b, lang)));
    const paginatedResponse = PaginationHelper.createPaginatedResponse(formatted, total, page, limit);

    return await this.responseHelper.successResponse(paginatedResponse, MessageCode.SUCCESS, lang);
  }

  /**
   * Obtener una sucursal por ID
   */
  async findOne(id: string, lang: string = 'es') {
    const branch = await this.branchRepository.findOne(id);
    if (!branch) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_NOT_FOUND,
          lang,
          { error: 'BRANCH_NOT_FOUND', branchId: id, message: 'Branch not found in database' },
          404,
        ),
      );
    }

    return await this.responseHelper.successResponse(
      branch,
      MessageCode.SUCCESS,
      lang,
    );
  }

  /**
   * Crear una nueva sucursal
   */
  async create(createBranchDto: any, lang: string = 'es') {
    // Verificar que el código no exista
    const existingBranch = await this.branchRepository.findByCode(createBranchDto.code);
    if (existingBranch) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_ALREADY_EXISTS,
          lang,
          { error: 'CODE_EXISTS', code: createBranchDto.code, message: 'Branch code already exists' },
          409,
        ),
      );
    }

    // Crear la sucursal
    const branch = this.branchRepository.create({
      ...createBranchDto,
      isActive: createBranchDto.isActive !== undefined ? createBranchDto.isActive : true,
    });

    const savedBranch = await this.branchRepository.save(branch);

    return await this.responseHelper.successResponse(
      savedBranch,
      MessageCode.RESOURCE_CREATED,
      lang,
      201,
    );
  }

  /**
   * Actualizar una sucursal
   */
  async update(id: string, updateBranchDto: any, lang: string = 'es') {
    const branch = await this.branchRepository.findOne(id);
    if (!branch) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_NOT_FOUND,
          lang,
          { error: 'BRANCH_NOT_FOUND', branchId: id, message: 'Branch not found in database' },
          404,
        ),
      );
    }

    // Si se actualiza el código, verificar que no exista
    if (updateBranchDto.code && updateBranchDto.code !== branch.code) {
      const existingBranch = await this.branchRepository.findByCode(updateBranchDto.code);
      if (existingBranch) {
        throw new ConflictException(
          await this.responseHelper.errorResponse(
            MessageCode.RESOURCE_ALREADY_EXISTS,
            lang,
            {
              error: 'CODE_EXISTS',
              code: updateBranchDto.code,
              message: 'Branch code already exists',
            },
            409,
          ),
        );
      }
    }

    // Actualizar la sucursal
    Object.assign(branch, updateBranchDto);
    const updatedBranch = await this.branchRepository.save(branch);

    return await this.responseHelper.successResponse(
      updatedBranch,
      MessageCode.RESOURCE_UPDATED,
      lang,
    );
  }

  /**
   * Eliminar (soft delete) una sucursal
   */
  async remove(id: string, lang: string = 'es') {
    const branch = await this.branchRepository.findOne(id);
    if (!branch) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_NOT_FOUND,
          lang,
          { error: 'BRANCH_NOT_FOUND', branchId: id, message: 'Branch not found in database' },
          404,
        ),
      );
    }

    // Soft delete: marcar como inactivo
    branch.status = RecordStatus.DELETED;
    await this.branchRepository.save(branch);

    return await this.responseHelper.successResponse(
      { id, message: 'Sucursal eliminada exitosamente' },
      MessageCode.SUCCESS,
      lang,
    );
  }
}


