import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchEntity } from '../entities/branch.entity';

/**
 * Repository de Branch
 * Implementa el acceso a datos para sucursales
 */
@Injectable()
export class BranchRepository {
  constructor(
    @InjectRepository(BranchEntity)
    private readonly repository: Repository<BranchEntity>,
  ) {}

  async findByCode(code: string): Promise<BranchEntity | null> {
    return this.repository.findOne({ where: { code } });
  }

  async findOne(id: string): Promise<BranchEntity | null> {
    return this.repository.findOne({ 
      where: { id },
      relations: ['company'],
    });
  }

  async save(branch: Partial<BranchEntity>): Promise<BranchEntity> {
    return this.repository.save(branch);
  }

  create(branchData: Partial<BranchEntity>): BranchEntity {
    return this.repository.create(branchData);
  }

  async findAll(): Promise<BranchEntity[]> {
    return this.repository.find({ 
      order: { createdAt: 'DESC' },
      relations: ['company'],
    });
  }

  /**
   * Encontrar sucursales por empresa
   */
  async findByCompany(companyId: string): Promise<BranchEntity[]> {
    return this.repository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      relations: ['company'],
    });
  }

  /**
   * Encontrar sucursales con paginación
   */
  async findWithPagination(skip: number, take: number): Promise<[BranchEntity[], number]> {
    return this.repository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
      relations: ['company'],
    });
  }

  /**
   * Buscar sucursales con filtros y paginación
   */
  async searchWithPagination(
    skip: number,
    take: number,
    filters?: {
      companyId?: string;
      isActive?: boolean;
      search?: string;
      code?: string;
      name?: string;
      type?: string;
    },
  ): Promise<[BranchEntity[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('branch')
      .leftJoinAndSelect('branch.company', 'company');

    // Filtro por empresa
    if (filters?.companyId) {
      queryBuilder.andWhere('branch.companyId = :companyId', { companyId: filters.companyId });
    }

    // Filtro por estado activo
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('branch.isActive = :isActive', { isActive: filters.isActive });
    }

    // Búsqueda global (search busca en code y name)
    if (filters?.search) {
      queryBuilder.andWhere(
        '(branch.code LIKE :search OR branch.name LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Filtros específicos por campo
    if (filters?.code) {
      queryBuilder.andWhere('branch.code LIKE :code', { code: `%${filters.code}%` });
    }

    if (filters?.name) {
      queryBuilder.andWhere('branch.name LIKE :name', { name: `%${filters.name}%` });
    }

    if (filters?.type) {
      queryBuilder.andWhere('branch.type = :type', { type: filters.type });
    }

    queryBuilder.orderBy('branch.createdAt', 'DESC');
    queryBuilder.skip(skip).take(take);

    return queryBuilder.getManyAndCount();
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}


