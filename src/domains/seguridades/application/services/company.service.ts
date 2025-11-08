import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CompanyRepository } from '../../infrastructure/repositories/company.repository';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode } from '@/common/messages/message-codes';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginationHelper } from '@/common/helpers/pagination.helper';

/**
 * Service de gestión de empresas
 */
@Injectable()
export class CompanyService {
  constructor(
    private companyRepository: CompanyRepository,
    private responseHelper: ResponseHelper,
  ) {}

  /**
   * Obtener todas las empresas (sin paginación)
   */
  async findAll(lang: string = 'es') {
    const companies = await this.companyRepository.findAll();
    return await this.responseHelper.successResponse(
      companies,
      MessageCode.SUCCESS,
      lang,
    );
  }

  /**
   * Obtener empresas con paginación
   */
  async findPaginated(
    paginationDto: PaginationDto,
    filters?: { 
      isActive?: boolean;
      search?: string;
      code?: string;
      name?: string;
      email?: string;
    },
    lang: string = 'es',
  ) {
    const { page, limit, skip } = PaginationHelper.normalizeParams(paginationDto);

    // Aplicar filtros si se proporciona alguno
    const hasFilters = filters && (
      filters.search || 
      filters.isActive !== undefined ||
      filters.code ||
      filters.name ||
      filters.email
    );

    const [companies, total] = hasFilters
      ? await this.companyRepository.searchWithPagination(skip, limit, filters)
      : await this.companyRepository.findWithPagination(skip, limit);

    const paginatedResponse = PaginationHelper.createPaginatedResponse(
      companies,
      total,
      page,
      limit,
    );

    return await this.responseHelper.successResponse(paginatedResponse, MessageCode.SUCCESS, lang);
  }

  /**
   * Obtener una empresa por ID
   */
  async findOne(id: string, lang: string = 'es') {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_NOT_FOUND,
          lang,
          { error: 'COMPANY_NOT_FOUND', companyId: id, message: 'Company not found in database' },
          404,
        ),
      );
    }

    return await this.responseHelper.successResponse(
      company,
      MessageCode.SUCCESS,
      lang,
    );
  }

  /**
   * Crear una nueva empresa
   */
  async create(createCompanyDto: any, lang: string = 'es') {
    // Verificar que el código no exista
    const existingCompany = await this.companyRepository.findByCode(createCompanyDto.code);
    if (existingCompany) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_ALREADY_EXISTS,
          lang,
          { error: 'CODE_EXISTS', code: createCompanyDto.code, message: 'Company code already exists' },
          409,
        ),
      );
    }

    // Crear la empresa
    const company = this.companyRepository.create({
      ...createCompanyDto,
      isActive: createCompanyDto.isActive !== undefined ? createCompanyDto.isActive : true,
    });

    const savedCompany = await this.companyRepository.save(company);

    return await this.responseHelper.successResponse(
      savedCompany,
      MessageCode.RESOURCE_CREATED,
      lang,
      201,
    );
  }

  /**
   * Actualizar una empresa
   */
  async update(id: string, updateCompanyDto: any, lang: string = 'es') {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_NOT_FOUND,
          lang,
          { error: 'COMPANY_NOT_FOUND', companyId: id, message: 'Company not found in database' },
          404,
        ),
      );
    }

    // Si se actualiza el código, verificar que no exista
    if (updateCompanyDto.code && updateCompanyDto.code !== company.code) {
      const existingCompany = await this.companyRepository.findByCode(updateCompanyDto.code);
      if (existingCompany) {
        throw new ConflictException(
          await this.responseHelper.errorResponse(
            MessageCode.RESOURCE_ALREADY_EXISTS,
            lang,
            {
              error: 'CODE_EXISTS',
              code: updateCompanyDto.code,
              message: 'Company code already exists',
            },
            409,
          ),
        );
      }
    }

    // Actualizar la empresa
    Object.assign(company, updateCompanyDto);
    const updatedCompany = await this.companyRepository.save(company);

    return await this.responseHelper.successResponse(
      updatedCompany,
      MessageCode.RESOURCE_UPDATED,
      lang,
    );
  }

  /**
   * Eliminar (soft delete) una empresa
   */
  async remove(id: string, lang: string = 'es') {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_NOT_FOUND,
          lang,
          { error: 'COMPANY_NOT_FOUND', companyId: id, message: 'Company not found in database' },
          404,
        ),
      );
    }

    // Soft delete: marcar como inactivo
    company.isActive = false;
    await this.companyRepository.save(company);

    return await this.responseHelper.successResponse(
      { id, message: 'Empresa eliminada exitosamente' },
      MessageCode.SUCCESS,
      lang,
    );
  }
}


