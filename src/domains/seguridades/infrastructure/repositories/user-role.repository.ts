import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleEntity } from '../entities/user-role.entity';

interface AccessFilters {
  userId?: string;
  roleId?: string;
  branchId?: string;
  isActive?: boolean;
}

@Injectable()
export class UserRoleRepository {
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly repository: Repository<UserRoleEntity>,
  ) {}

  async findWithPagination(skip: number, take: number, filters?: AccessFilters): Promise<[UserRoleEntity[], number]> {
    const query = this.repository
      .createQueryBuilder('access')
      .leftJoinAndSelect('access.user', 'user')
      .leftJoinAndSelect('access.role', 'role')
      .orderBy('access.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (filters?.userId) {
      query.andWhere('access.userId = :userId', { userId: filters.userId });
    }

    if (filters?.roleId) {
      query.andWhere('access.roleId = :roleId', { roleId: filters.roleId });
    }

    if (filters?.branchId) {
      query.andWhere('access.branchId = :branchId', { branchId: filters.branchId });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('access.isActive = :isActive', { isActive: filters.isActive });
    }

    return query.getManyAndCount();
  }

  async findOne(id: string): Promise<UserRoleEntity | null> {
    return this.repository.findOne({ where: { id }, relations: ['user', 'role'] });
  }

  /**
   * Buscar roles de un usuario
   */
  async findByUserId(userId: string): Promise<UserRoleEntity[]> {
    return this.repository.find({
      where: { userId, isActive: true },
      relations: ['role'],
    });
  }

  /**
   * Eliminar todas las asignaciones de roles de un usuario
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }

  /**
   * Crear una asignación de rol
   */
  async create(data: Partial<UserRoleEntity>): Promise<UserRoleEntity> {
    // Crear la entidad explícitamente con los campos requeridos
    const userRole = this.repository.create({
      userId: data.userId,
      roleId: data.roleId,
      branchId: data.branchId || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    return this.repository.save(userRole);
  }

  /**
   * Guardar asignación de rol
   */
  async save(userRole: Partial<UserRoleEntity>): Promise<UserRoleEntity> {
    return this.repository.save(userRole);
  }
}




