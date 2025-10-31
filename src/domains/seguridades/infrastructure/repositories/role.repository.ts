import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';

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
    const query = this.repository.createQueryBuilder('role').where('role.isActive = :isActive', { isActive: true });
    
    if (companyId) {
      query.andWhere('role.companyId = :companyId', { companyId });
    }

    return query.getMany();
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

