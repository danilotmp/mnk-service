import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';
import { RecordStatus } from '@/common/enums/record-status.enum';

/**
 * Repositorio para la entidad Role
 */
@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) {}

  findAll(companyId?: string): Promise<RoleEntity[]> {
    const query = this.repository
      .createQueryBuilder('role')
      .where('role.status != :deletedStatus', { deletedStatus: RecordStatus.DELETED });

    if (companyId) {
      query.andWhere('role.companyId = :companyId', { companyId });
    }

    return query.getMany();
  }

  /**
   * Encontrar roles con paginación
   */
  async findWithPagination(
    skip: number,
    take: number,
    companyId?: string,
  ): Promise<[RoleEntity[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('role')
      .where('role.status != :deletedStatus', { deletedStatus: RecordStatus.DELETED });

    if (companyId) {
      queryBuilder.andWhere('role.companyId = :companyId', { companyId });
    }

    queryBuilder.orderBy('role.createdAt', 'DESC');
    queryBuilder.skip(skip).take(take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * Buscar roles con filtros y paginación
   */
  async searchWithPagination(
    skip: number,
    take: number,
    filters?: {
      companyId?: string;
      status?: number;
      searchTerm?: string;
    },
  ): Promise<[RoleEntity[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('role');

    if (filters?.companyId) {
      queryBuilder.andWhere('role.companyId = :companyId', { companyId: filters.companyId });
    }

    if (filters?.status !== undefined) {
      queryBuilder.andWhere('role.status = :status', { status: filters.status });
    } else {
      // Por defecto, excluir eliminados
      queryBuilder.andWhere('role.status != :deletedStatus', { deletedStatus: RecordStatus.DELETED });
    }

    if (filters?.searchTerm) {
      queryBuilder.andWhere(
        '(role.name LIKE :searchTerm OR role.displayName LIKE :searchTerm OR role.description LIKE :searchTerm)',
        { searchTerm: `%${filters.searchTerm}%` },
      );
    }

    queryBuilder.orderBy('role.createdAt', 'DESC');
    queryBuilder.skip(skip).take(take);

    return queryBuilder.getManyAndCount();
  }

  findOne(id: string): Promise<RoleEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
  }

  findByCode(code: string, companyId?: string): Promise<RoleEntity | null> {
    const query = this.repository.createQueryBuilder('role').where('role.name = :code', { code });

    if (companyId) {
      query.andWhere('role.companyId = :companyId', { companyId });
    }

    return query.getOne();
  }

  create(roleData: Partial<RoleEntity>): RoleEntity {
    return this.repository.create(roleData);
  }

  async save(role: RoleEntity): Promise<RoleEntity> {
    return this.repository.save(role);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
