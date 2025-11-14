import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RoleRepository } from '../../infrastructure/repositories/role.repository';
import { ResponseHelper } from '@/common/messages/response.helper';
import { RecordStatusHelper } from '@/common/helpers/record-status.helper';
import { RecordStatus } from '@/common/enums/record-status.enum';
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
    private recordStatusHelper: RecordStatusHelper,
  ) {}

  /**
   * Formatear rol con statusDescription y permisos
   */
  private async formatRoleWithStatus(role: any, lang: string = 'es') {
    const permissions =
      role?.rolePermissions && Array.isArray(role.rolePermissions)
        ? await Promise.all(
            role.rolePermissions
              .filter((rp) => rp?.permission)
              .map(async (rp) => {
                const permission = rp.permission;
                return {
                  id: permission.id,
                  code: permission.code,
                  name: permission.name,
                  description: permission.description,
                  type: permission.type,
                  resource: permission.resource,
                  action: permission.action,
                  route: permission.route,
                  isPublic: permission.isPublic,
                  ...(await this.recordStatusHelper.format(permission.status, lang)),
                };
              }),
          )
        : [];

    const { rolePermissions, ...roleWithoutRelations } = role;

    return {
      ...roleWithoutRelations,
      permissions,
      permissionsCount: permissions.length,
      ...(await this.recordStatusHelper.format(role.status, lang)),
    };
  }

  /**
   * Obtener todos los roles (sin paginación - para compatibilidad)
   */
  async findAll(companyId?: string, lang: string = 'es') {
    const roles = await this.roleRepository.findAll(companyId);
    const formattedRoles = await Promise.all(
      roles.map((role) => this.formatRoleWithStatus(role, lang))
    );
    return await this.responseHelper.successResponse(formattedRoles, MessageCode.SUCCESS, lang);
  }

  /**
   * Obtener roles con paginación
   */
  async findPaginated(
    paginationDto: PaginationDto,
    filters?: { companyId?: string; status?: number; searchTerm?: string; isSystem?: boolean },
    lang: string = 'es',
  ) {
    const { page, limit, skip } = PaginationHelper.normalizeParams(paginationDto);

    const [roles, total] =
      filters?.searchTerm || filters?.status !== undefined || filters?.isSystem !== undefined
        ? await this.roleRepository.searchWithPagination(skip, limit, filters)
        : await this.roleRepository.findWithPagination(skip, limit, filters?.companyId, filters?.isSystem);

    const formattedRoles = await Promise.all(
      roles.map((role) => this.formatRoleWithStatus(role, lang))
    );

    const paginatedResponse = PaginationHelper.createPaginatedResponse(formattedRoles, total, page, limit);

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
    // Verificar que el código del rol no exista
    const existingRoleByCode = await this.roleRepository.findByCode(
      createRoleDto.code,
      createRoleDto.companyId,
    );
    if (existingRoleByCode) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_CONFLICT,
          lang,
          {
            error: 'ROLE_CODE_EXISTS',
            code: createRoleDto.code,
            companyId: createRoleDto.companyId,
            message: 'El código del rol ya existe',
          },
          409,
        ),
      );
    }

    // Verificar que el nombre del rol no exista
    const existingRoleByName = await this.roleRepository.findByName(
      createRoleDto.name,
      createRoleDto.companyId,
    );
    if (existingRoleByName) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_CONFLICT,
          lang,
          {
            error: 'ROLE_NAME_EXISTS',
            name: createRoleDto.name,
            companyId: createRoleDto.companyId,
            message: 'El nombre del rol ya existe',
          },
          409,
        ),
      );
    }

    // Crear el rol
    const role = this.roleRepository.create({
      ...createRoleDto,
      code: createRoleDto.code.toUpperCase(), // Normalizar código a mayúsculas
      status: createRoleDto.status !== undefined ? createRoleDto.status : RecordStatus.ACTIVE,
      isSystem: createRoleDto.isSystem !== undefined ? createRoleDto.isSystem : false,
    });

    const savedRole = await this.roleRepository.save(role);
    const formattedRole = await this.formatRoleWithStatus(savedRole, lang);

    return await this.responseHelper.successResponse(formattedRole, MessageCode.SUCCESS, lang, 201);
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

    // Validar que el código no esté duplicado (si se está cambiando)
    if (updateRoleDto.code) {
      const normalizedCode = updateRoleDto.code.toUpperCase();
      if (normalizedCode !== role.code) {
        const existingRoleByCode = await this.roleRepository.findByCode(normalizedCode, role.companyId);
        if (existingRoleByCode && existingRoleByCode.id !== id) {
          throw new ConflictException(
            await this.responseHelper.errorResponse(
              MessageCode.RESOURCE_CONFLICT,
              lang,
              {
                error: 'ROLE_CODE_EXISTS',
                code: normalizedCode,
                companyId: role.companyId,
                message: 'El código del rol ya existe',
              },
              409,
            ),
          );
        }
        // Normalizar código a mayúsculas
        updateRoleDto.code = normalizedCode;
      }
    }

    // Validar que el nombre no esté duplicado (si se está cambiando)
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRoleByName = await this.roleRepository.findByName(updateRoleDto.name, role.companyId);
      if (existingRoleByName && existingRoleByName.id !== id) {
        throw new ConflictException(
          await this.responseHelper.errorResponse(
            MessageCode.RESOURCE_CONFLICT,
            lang,
            {
              error: 'ROLE_NAME_EXISTS',
              name: updateRoleDto.name,
              companyId: role.companyId,
              message: 'El nombre del rol ya existe',
            },
            409,
          ),
        );
      }
    }

    // Actualizar el rol
    Object.assign(role, updateRoleDto);
    const updatedRole = await this.roleRepository.save(role);
    const formattedRole = await this.formatRoleWithStatus(updatedRole, lang);

    return await this.responseHelper.successResponse(formattedRole, MessageCode.SUCCESS, lang);
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
    role.status = RecordStatus.DELETED;
    await this.roleRepository.save(role);

    return await this.responseHelper.successResponse(
      { id, message: 'Rol eliminado exitosamente' },
      MessageCode.SUCCESS,
      lang,
    );
  }
}
