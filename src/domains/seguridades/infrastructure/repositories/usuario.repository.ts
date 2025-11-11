import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from '../entities/usuario.entity';

/**
 * Repository de Usuario
 * Implementa el acceso a datos para usuarios
 */
@Injectable()
export class UsuarioRepository {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly repository: Repository<UsuarioEntity>,
  ) {}

  async findByEmail(email: string): Promise<UsuarioEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<UsuarioEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async save(usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity> {
    return this.repository.save(usuario);
  }

  create(usuarioData: Partial<UsuarioEntity>): UsuarioEntity {
    return this.repository.create(usuarioData);
  }

  async findAll(): Promise<UsuarioEntity[]> {
    return this.repository.find();
  }

  /**
   * Encontrar usuarios con paginación
   */
  async findWithPagination(skip: number, take: number): Promise<[UsuarioEntity[], number]> {
    return this.repository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  /**
   * Buscar usuarios con filtros y paginación
   */
  async searchWithPagination(
    skip: number,
    take: number,
    filters?: {
      companyId?: string;
      isActive?: boolean;
      searchTerm?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<[UsuarioEntity[], number]> {
    const queryBuilder = this.repository.createQueryBuilder('usuario');

    // Cargar relaciones de roles
    queryBuilder.leftJoinAndSelect('usuario.userRoles', 'userRoles');
    queryBuilder.leftJoinAndSelect('userRoles.role', 'role');

    // Filtro por companyId
    if (filters?.companyId) {
      queryBuilder.andWhere('usuario.companyId = :companyId', { companyId: filters.companyId });
    }

    // Filtro por estado activo
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('usuario.isActive = :isActive', { isActive: filters.isActive });
    }

    // Búsqueda global (searchTerm busca en email, firstName y lastName)
    if (filters?.searchTerm) {
      queryBuilder.andWhere(
        '(usuario.email LIKE :searchTerm OR usuario.firstName LIKE :searchTerm OR usuario.lastName LIKE :searchTerm)',
        { searchTerm: `%${filters.searchTerm}%` },
      );
    }

    // Filtros específicos por campo
    if (filters?.email) {
      queryBuilder.andWhere('usuario.email LIKE :email', { email: `%${filters.email}%` });
    }

    if (filters?.firstName) {
      queryBuilder.andWhere('usuario.firstName LIKE :firstName', { firstName: `%${filters.firstName}%` });
    }

    if (filters?.lastName) {
      queryBuilder.andWhere('usuario.lastName LIKE :lastName', { lastName: `%${filters.lastName}%` });
    }

    queryBuilder.orderBy('usuario.createdAt', 'DESC');
    queryBuilder.skip(skip).take(take);

    return queryBuilder.getManyAndCount();
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
