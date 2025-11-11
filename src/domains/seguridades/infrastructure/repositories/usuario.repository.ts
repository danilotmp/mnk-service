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

  /**
   * Encontrar usuario por ID sin cargar relaciones
   */
  async findOneBasic(id: string): Promise<UsuarioEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOne(id: string): Promise<UsuarioEntity | null> {
    try {
      // Primero cargar el usuario
      const usuario = await this.repository.findOne({ where: { id } });
      if (!usuario) return null;

      // Luego cargar las relaciones por separado para evitar problemas con joins
      const usuarioConRelaciones = await this.repository
        .createQueryBuilder('usuario')
        .leftJoinAndSelect('usuario.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'role')
        .where('usuario.id = :id', { id })
        .getOne();

      return usuarioConRelaciones;
    } catch (error) {
      console.error('[UsuarioRepository.findOne] Error al cargar usuario con relaciones:', error);
      console.error('[UsuarioRepository.findOne] Error details:', error.message);
      // Fallback: cargar usuario sin relaciones
      try {
        return await this.repository.findOne({ where: { id } });
      } catch (fallbackError) {
        console.error('[UsuarioRepository.findOne] Error en fallback:', fallbackError);
        return null;
      }
    }
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
    try {
      const queryBuilder = this.repository.createQueryBuilder('usuario');
      
      queryBuilder
        .leftJoinAndSelect('usuario.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'role')
        .orderBy('usuario.createdAt', 'DESC')
        .skip(skip)
        .take(take);

      return await queryBuilder.getManyAndCount();
    } catch (error) {
      console.error('[UsuarioRepository.findWithPagination] Error:', error);
      // Fallback sin relaciones
      return this.repository.findAndCount({
        skip,
        take,
        order: { createdAt: 'DESC' },
      });
    }
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
    try {
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

      return await queryBuilder.getManyAndCount();
    } catch (error) {
      console.error('[UsuarioRepository.searchWithPagination] Error:', error);
      // Fallback sin relaciones
      const queryBuilder = this.repository.createQueryBuilder('usuario');
      
      if (filters?.companyId) {
        queryBuilder.andWhere('usuario.companyId = :companyId', { companyId: filters.companyId });
      }
      if (filters?.isActive !== undefined) {
        queryBuilder.andWhere('usuario.isActive = :isActive', { isActive: filters.isActive });
      }
      
      queryBuilder.orderBy('usuario.createdAt', 'DESC');
      queryBuilder.skip(skip).take(take);
      
      return await queryBuilder.getManyAndCount();
    }
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
