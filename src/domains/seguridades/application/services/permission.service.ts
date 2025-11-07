import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionRepository } from '../../infrastructure/repositories/permission.repository';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode } from '@/common/messages/message-codes';
import { CreatePermissionDto } from '../../presentation/dto/create-permission.dto';
import { UpdatePermissionDto } from '../../presentation/dto/update-permission.dto';
import { PermissionType } from '../../infrastructure/entities/permission.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginationHelper } from '@/common/helpers/pagination.helper';

/**
 * Service de gestión de permisos
 */
@Injectable()
export class PermissionService {
  constructor(
    private permissionRepository: PermissionRepository,
    private responseHelper: ResponseHelper,
  ) {}

  /**
   * Obtener todos los permisos (sin paginación - para compatibilidad)
   */
  async findAll(type?: PermissionType, lang: string = 'es') {
    const permissions = type
      ? await this.permissionRepository.findByType(type)
      : await this.permissionRepository.findAll();
    return await this.responseHelper.successResponse(permissions, MessageCode.SUCCESS, lang);
  }

  /**
   * Obtener permisos con paginación
   */
  async findPaginated(
    paginationDto: PaginationDto,
    filters?: { type?: PermissionType; isActive?: boolean; searchTerm?: string },
    lang: string = 'es',
  ) {
    const { page, limit, skip } = PaginationHelper.normalizeParams(paginationDto);

    const [permissions, total] =
      filters?.searchTerm || filters?.isActive !== undefined
        ? await this.permissionRepository.searchWithPagination(skip, limit, filters)
        : await this.permissionRepository.findWithPagination(skip, limit, filters?.type);

    const paginatedResponse = PaginationHelper.createPaginatedResponse(
      permissions,
      total,
      page,
      limit,
    );

    return await this.responseHelper.successResponse(paginatedResponse, MessageCode.SUCCESS, lang);
  }

  /**
   * Obtener un permiso por ID
   */
  async findOne(id: string, lang: string = 'es') {
    const permission = await this.permissionRepository.findOne(id);
    if (!permission) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.NOT_FOUND,
          lang,
          {
            error: 'PERMISSION_NOT_FOUND',
            permissionId: id,
            message: 'Permission not found in database',
          },
          404,
        ),
      );
    }

    return await this.responseHelper.successResponse(permission, MessageCode.SUCCESS, lang);
  }

  /**
   * Crear un nuevo permiso
   */
  async create(createPermissionDto: CreatePermissionDto, lang: string = 'es') {
    // Verificar que el código del permiso no exista
    const existingPermission = await this.permissionRepository.findByCode(createPermissionDto.code);
    if (existingPermission) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.RESOURCE_CONFLICT,
          lang,
          {
            error: 'PERMISSION_CODE_EXISTS',
            code: createPermissionDto.code,
            message: 'Permission code already exists',
          },
          409,
        ),
      );
    }

    // Crear el permiso
    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      type: createPermissionDto.type || PermissionType.PAGE,
      isActive: createPermissionDto.isActive !== undefined ? createPermissionDto.isActive : true,
      isPublic: createPermissionDto.isPublic !== undefined ? createPermissionDto.isPublic : false,
      isSystem: createPermissionDto.isSystem !== undefined ? createPermissionDto.isSystem : false,
    });

    const savedPermission = await this.permissionRepository.save(permission);

    return await this.responseHelper.successResponse(
      savedPermission,
      MessageCode.SUCCESS,
      lang,
      201,
    );
  }

  /**
   * Actualizar un permiso
   */
  async update(id: string, updatePermissionDto: UpdatePermissionDto, lang: string = 'es') {
    const permission = await this.permissionRepository.findOne(id);
    if (!permission) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.NOT_FOUND,
          lang,
          {
            error: 'PERMISSION_NOT_FOUND',
            permissionId: id,
            message: 'Permission not found in database',
          },
          404,
        ),
      );
    }

    // Si es un permiso del sistema, no permitir ciertos cambios
    if (permission.isSystem) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.BUSINESS_RULE_VIOLATION,
          lang,
          {
            error: 'SYSTEM_PERMISSION_PROTECTED',
            permissionId: id,
            message: 'System permissions cannot be modified',
          },
          409,
        ),
      );
    }

    // Actualizar el permiso
    Object.assign(permission, updatePermissionDto);
    const updatedPermission = await this.permissionRepository.save(permission);

    return await this.responseHelper.successResponse(updatedPermission, MessageCode.SUCCESS, lang);
  }

  /**
   * Eliminar un permiso (soft delete)
   */
  async remove(id: string, lang: string = 'es') {
    const permission = await this.permissionRepository.findOne(id);
    if (!permission) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.NOT_FOUND,
          lang,
          {
            error: 'PERMISSION_NOT_FOUND',
            permissionId: id,
            message: 'Permission not found in database',
          },
          404,
        ),
      );
    }

    // Si es un permiso del sistema, no permitir eliminarlo
    if (permission.isSystem) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.BUSINESS_RULE_VIOLATION,
          lang,
          {
            error: 'SYSTEM_PERMISSION_PROTECTED',
            permissionId: id,
            message: 'System permissions cannot be deleted',
          },
          409,
        ),
      );
    }

    // Soft delete: marcar como inactivo
    permission.isActive = false;
    await this.permissionRepository.save(permission);

    return await this.responseHelper.successResponse(
      { id, message: 'Permiso eliminado exitosamente' },
      MessageCode.SUCCESS,
      lang,
    );
  }
}

