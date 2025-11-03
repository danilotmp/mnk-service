import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RoleRepository } from '../../infrastructure/repositories/role.repository';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode } from '@/common/messages/message-codes';
import { CreateRoleDto } from '../../presentation/dto/create-role.dto';
import { UpdateRoleDto } from '../../presentation/dto/update-role.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginationHelper } from '@/common/helpers/pagination.helper';

/**
 * Service de gestión de roles
 */
@Injectable()
export class RoleService {
  constructor(
    private roleRepository: RoleRepository,
    private responseHelper: ResponseHelper,
  ) {}

  /**
   * Obtener todos los roles (sin paginación - para compatibilidad)
   */
  async findAll(companyId?: string, lang: string = 'es') {
    const roles = await this.roleRepository.findAll(companyId);
    return await this.responseHelper.successResponse(roles, MessageCode.SUCCESS, lang);
  }

  /**
   * Obtener roles con paginación
   */
  async findPaginated(
    paginationDto: PaginationDto,
    filters?: { companyId?: string; isActive?: boolean; searchTerm?: string },
    lang: string = 'es',
  ) {
    const { page, limit, skip } = PaginationHelper.normalizeParams(paginationDto);

    const [roles, total] = filters?.searchTerm || filters?.isActive !== undefined
      ? await this.roleRepository.searchWithPagination(skip, limit, filters)
      : await this.roleRepository.findWithPagination(skip, limit, filters?.companyId);

    const paginatedResponse = PaginationHelper.createPaginatedResponse(roles, total, page, limit);

    return await this.responseHelper.successResponse(paginatedResponse, MessageCode.SUCCESS, lang);
  }

  /**
   * Obtener un rol por ID
   */
  async findOne(id: string, lang: string = 'es') {
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.ROLE_NOT_FOUND,
          lang,
          { error: 'ROLE_NOT_FOUND', roleId: id, message: 'Role not found in database' },
          404,
        ),
      );
    }

    return await this.responseHelper.successResponse(role, MessageCode.SUCCESS, lang);
  }

  /**
   * Crear un nuevo rol
   */
  async create(createRoleDto: CreateRoleDto, lang: string = 'es') {
    // Verificar que el nombre del rol no exista en la misma empresa
    const existingRole = await this.roleRepository.findByCode(createRoleDto.name, createRoleDto.companyId);
    if (existingRole) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_CONFLICT,
          lang,
          {
            error: 'ROLE_NAME_EXISTS',
            name: createRoleDto.name,
            companyId: createRoleDto.companyId,
            message: 'Role name already exists for this company',
          },
          409,
        ),
      );
    }

    // Crear el rol
    const role = this.roleRepository.create({
      ...createRoleDto,
      isActive: createRoleDto.isActive !== undefined ? createRoleDto.isActive : true,
      isSystem: createRoleDto.isSystem !== undefined ? createRoleDto.isSystem : false,
      displayName: createRoleDto.displayName || createRoleDto.name,
    });

    const savedRole = await this.roleRepository.save(role);

    return await this.responseHelper.successResponse(
      savedRole,
      MessageCode.SUCCESS,
      lang,
      201,
    );
  }

  /**
   * Actualizar un rol
   */
  async update(id: string, updateRoleDto: UpdateRoleDto, lang: string = 'es') {
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.ROLE_NOT_FOUND,
          lang,
          { error: 'ROLE_NOT_FOUND', roleId: id, message: 'Role not found in database' },
          404,
        ),
      );
    }

    // Si es un rol del sistema, no permitir ciertos cambios
    if (role.isSystem && updateRoleDto.name) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.BUSINESS_RULE_VIOLATION,
          lang,
          {
            error: 'SYSTEM_ROLE_PROTECTED',
            roleId: id,
            message: 'System roles cannot have their name modified',
          },
          409,
        ),
      );
    }

    // Si se actualiza el nombre, verificar que no exista en la misma empresa
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findByCode(
        updateRoleDto.name,
        updateRoleDto.companyId || role.companyId,
      );
      if (existingRole) {
        throw new ConflictException(
          await this.responseHelper.errorResponse(
            MessageCode.RESOURCE_CONFLICT,
            lang,
            {
              error: 'ROLE_NAME_EXISTS',
              name: updateRoleDto.name,
              message: 'Role name already exists for this company',
            },
            409,
          ),
        );
      }
    }

    // Actualizar el rol
    Object.assign(role, updateRoleDto);
    const updatedRole = await this.roleRepository.save(role);

    return await this.responseHelper.successResponse(
      updatedRole,
      MessageCode.SUCCESS,
      lang,
    );
  }

  /**
   * Eliminar un rol (soft delete)
   */
  async remove(id: string, lang: string = 'es') {
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.ROLE_NOT_FOUND,
          lang,
          { error: 'ROLE_NOT_FOUND', roleId: id, message: 'Role not found in database' },
          404,
        ),
      );
    }

    // Si es un rol del sistema, no permitir eliminarlo
    if (role.isSystem) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.BUSINESS_RULE_VIOLATION,
          lang,
          {
            error: 'SYSTEM_ROLE_PROTECTED',
            roleId: id,
            message: 'System roles cannot be deleted',
          },
          409,
        ),
      );
    }

    // Soft delete: marcar como inactivo
    role.isActive = false;
    await this.roleRepository.save(role);

    return await this.responseHelper.successResponse(
      { id, message: 'Rol eliminado exitosamente' },
      MessageCode.SUCCESS,
      lang,
    );
  }
}

