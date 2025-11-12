import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from '../entities/company.entity';
import { RecordStatus } from '@/common/enums/record-status.enum';

/**
 * Repository de Company
 * Implementa el acceso a datos para empresas
 */
@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly repository: Repository<CompanyEntity>,
  ) {}

  async findByCode(code: string): Promise<CompanyEntity | null> {
    return this.repository.findOne({ where: { code } });
  }

  async findOne(id: string): Promise<CompanyEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(company: Partial<CompanyEntity>): Promise<CompanyEntity> {
    return this.repository.save(company);
  }

  create(companyData: Partial<CompanyEntity>): CompanyEntity {
    return this.repository.create(companyData);
  }

  async findAll(): Promise<CompanyEntity[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Encontrar empresas con paginación
   */
  async findWithPagination(skip: number, take: number): Promise<[CompanyEntity[], number]> {
    return this.repository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar empresas con filtros y paginación
   */
  async searchWithPagination(
    skip: number,
    take: number,
    filters?: {
      status?: number;
      search?: string;
      code?: string;
      name?: string;
      email?: string;
    },
  ): Promise<[CompanyEntity[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('company');

    // Filtro por estado
    if (filters?.status !== undefined) {
      queryBuilder.andWhere('company.status = :status', { status: filters.status });
    } else {
      // Por defecto, excluir eliminados
      queryBuilder.andWhere('company.status != :deletedStatus', { deletedStatus: RecordStatus.DELETED });
    }

    // Búsqueda global (search busca en code, name y email)
    if (filters?.search) {
      queryBuilder.andWhere(
        '(company.code LIKE :search OR company.name LIKE :search OR company.email LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Filtros específicos por campo
    if (filters?.code) {
      queryBuilder.andWhere('company.code LIKE :code', { code: `%${filters.code}%` });
    }

    if (filters?.name) {
      queryBuilder.andWhere('company.name LIKE :name', { name: `%${filters.name}%` });
    }

    if (filters?.email) {
      queryBuilder.andWhere('company.email LIKE :email', { email: `%${filters.email}%` });
    }

    queryBuilder.orderBy('company.createdAt', 'DESC');
    queryBuilder.skip(skip).take(take);

    return queryBuilder.getManyAndCount();
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}


