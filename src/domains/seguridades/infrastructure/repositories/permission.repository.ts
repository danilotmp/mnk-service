import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity, PermissionType } from '../entities/permission.entity';

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
      where: { isActive: true },
      order: { code: 'ASC' },
    });
  }

  findByType(type: PermissionType): Promise<PermissionEntity[]> {
    return this.repository.find({
      where: { type, isActive: true },
      order: { code: 'ASC' },
    });
  }

  /**
   * Encontrar permisos con paginación
   */
  async findWithPagination(skip: number, take: number, type?: PermissionType): Promise<[PermissionEntity[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('permission').where('permission.isActive = :isActive', { isActive: true });

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
      isActive?: boolean;
      searchTerm?: string;
    },
  ): Promise<[PermissionEntity[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('permission');

    if (filters?.isActive !== undefined) {
      queryBuilder.where('permission.isActive = :isActive', { isActive: filters.isActive });
    } else {
      queryBuilder.where('permission.isActive = :isActive', { isActive: true });
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
    return this.repository.findOne({ where: { code, isActive: true } });
  }

  findByRoute(route: string): Promise<PermissionEntity | null> {
    return this.repository.findOne({ where: { route, isActive: true } });
  }

  findByMenuId(menuId: string): Promise<PermissionEntity | null> {
    return this.repository.findOne({ where: { menuId, isActive: true } });
  }

  findPublicPages(): Promise<PermissionEntity[]> {
    return this.repository.find({
      where: { type: PermissionType.PAGE, isPublic: true, isActive: true },
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

