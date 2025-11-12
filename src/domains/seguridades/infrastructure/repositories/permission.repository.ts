import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity, PermissionType } from '../entities/permission.entity';
import { RecordStatus } from '@/common/enums/record-status.enum';

/**
 * Repositorio para la entidad Permission
 */
@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private repository: Repository<PermissionEntity>,
  ) {}

  findAll(): Promise<PermissionEntity[]> {
    return this.repository.find({
      where: { status: RecordStatus.ACTIVE },
      order: { code: 'ASC' },
    });
  }

  findByType(type: PermissionType): Promise<PermissionEntity[]> {
    return this.repository.find({
      where: { type, status: RecordStatus.ACTIVE },
      order: { code: 'ASC' },
    });
  }

  /**
   * Encontrar permisos con paginación
   */
  async findWithPagination(
    skip: number,
    take: number,
    type?: PermissionType,
  ): Promise<[PermissionEntity[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('permission')
      .where('permission.status != :deletedStatus', { deletedStatus: RecordStatus.DELETED });

    if (type) {
      queryBuilder.andWhere('permission.type = :type', { type });
    }

    queryBuilder.orderBy('permission.code', 'ASC');
    queryBuilder.skip(skip).take(take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * Buscar permisos con filtros y paginación
   */
  async searchWithPagination(
    skip: number,
    take: number,
    filters?: {
      type?: PermissionType;
      status?: number;
      searchTerm?: string;
    },
  ): Promise<[PermissionEntity[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('permission');

    if (filters?.status !== undefined) {
      queryBuilder.where('permission.status = :status', { status: filters.status });
    } else {
      // Por defecto, excluir eliminados
      queryBuilder.where('permission.status != :deletedStatus', { deletedStatus: RecordStatus.DELETED });
    }

    if (filters?.type) {
      queryBuilder.andWhere('permission.type = :type', { type: filters.type });
    }

    if (filters?.searchTerm) {
      queryBuilder.andWhere(
        '(permission.code LIKE :searchTerm OR permission.name LIKE :searchTerm OR permission.description LIKE :searchTerm)',
        { searchTerm: `%${filters.searchTerm}%` },
      );
    }

    queryBuilder.orderBy('permission.code', 'ASC');
    queryBuilder.skip(skip).take(take);

    return queryBuilder.getManyAndCount();
  }

  findOne(id: string): Promise<PermissionEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByCode(code: string): Promise<PermissionEntity | null> {
    return this.repository.findOne({ where: { code, status: RecordStatus.ACTIVE } });
  }

  findByRoute(route: string): Promise<PermissionEntity | null> {
    return this.repository.findOne({ where: { route, status: RecordStatus.ACTIVE } });
  }

  findByMenuId(menuId: string): Promise<PermissionEntity | null> {
    return this.repository.findOne({ where: { menuId, status: RecordStatus.ACTIVE } });
  }

  findPublicPages(): Promise<PermissionEntity[]> {
    return this.repository.find({
      where: { type: PermissionType.PAGE, isPublic: true, status: RecordStatus.ACTIVE },
      order: { code: 'ASC' },
    });
  }

  create(permissionData: Partial<PermissionEntity>): PermissionEntity {
    return this.repository.create(permissionData);
  }

  async save(permission: PermissionEntity): Promise<PermissionEntity> {
    return this.repository.save(permission);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
