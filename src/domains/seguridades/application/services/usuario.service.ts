import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import { UserRoleRepository } from '../../infrastructure/repositories/user-role.repository';
import { BranchRepository } from '../../infrastructure/repositories/branch.repository';
import { RoleService } from './role.service';
import { ResponseHelper } from '@/common/messages/response.helper';
import { RecordStatusHelper } from '@/common/helpers/record-status.helper';
import { RecordStatus } from '@/common/enums/record-status.enum';
import { MessageCode } from '@/common/messages/message-codes';
import { CreateUsuarioDto } from '../../presentation/dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../../presentation/dto/update-usuario.dto';
import { UpdateUsuarioCompletoDto } from '../../presentation/dto/update-usuario-completo.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginationHelper } from '@/common/helpers/pagination.helper';
import * as bcrypt from 'bcrypt';

/**
 * Service de gestión de usuarios
 */
@Injectable()
export class UsuarioService {
  constructor(
    private usuarioRepository: UsuarioRepository,
    private userRoleRepository: UserRoleRepository,
    private branchRepository: BranchRepository,
    private roleService: RoleService,
    private responseHelper: ResponseHelper,
    private recordStatusHelper: RecordStatusHelper,
  ) {}

  /**
   * Formatear usuario con roles y status
   * Método helper privado para dar formato consistente
   */
  private async formatUserWithRoles(usuario: any, lang: string = 'es') {
    const { password, userRoles, ...userWithoutPassword } = usuario;
    
    // Formatear roles si existen
    const roles = userRoles && userRoles.length > 0
      ? userRoles
          .filter((ur) => ur && ur.status === RecordStatus.ACTIVE && ur.role)  // ✅ Validar que role existe
          .map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            displayName: ur.role.displayName,
            description: ur.role.description,
            assignedAt: ur.createdAt,
          }))
      : [];

    return {
      ...userWithoutPassword,
      ...(await this.recordStatusHelper.format(usuario.status, lang)),
      roles,
    };
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId: string, lang: string = 'es') {
    const usuario = await this.usuarioRepository.findOne(userId);
    if (!usuario) {
      const errorResponse = await this.responseHelper.errorResponse(
        MessageCode.USER_NOT_FOUND,
        lang,
        {
          error: 'USER_NOT_FOUND',
          userId,
          message: 'User not found in database',
        },
        404,
      );
      throw new NotFoundException(errorResponse);
    }

    // Retornar sin la contraseña
    const { password, ...userWithoutPassword } = usuario;

    return await this.responseHelper.successResponse(
      userWithoutPassword,
      MessageCode.SUCCESS,
      lang,
    );
  }

  /**
   * Obtener todos los usuarios (sin paginación - para compatibilidad)
   */
  async findAll(lang: string = 'es') {
    const usuarios = await this.usuarioRepository.findAll();

    // Retornar sin contraseñas
    const usuariosSinPassword = usuarios.map((usuario) => {
      const { password, ...userWithoutPassword } = usuario;
      return userWithoutPassword;
    });

    return await this.responseHelper.successResponse(
      usuariosSinPassword,
      MessageCode.SUCCESS,
      lang,
    );
  }

  /**
   * Obtener usuarios con paginación
   */
  async findPaginated(
    paginationDto: PaginationDto,
    filters?: { 
      companyId?: string; 
      status?: number; 
      searchTerm?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    },
    lang: string = 'es',
  ) {
    const { page, limit, skip } = PaginationHelper.normalizeParams(paginationDto);

    // Aplicar filtros si se proporciona alguno
    const hasFilters = filters && (
      filters.searchTerm || 
      filters.companyId || 
      filters.status !== undefined ||
      filters.email ||
      filters.firstName ||
      filters.lastName
    );

    const [usuarios, total] = hasFilters
      ? await this.usuarioRepository.searchWithPagination(skip, limit, filters)
      : await this.usuarioRepository.findWithPagination(skip, limit);

    // Formatear usuarios con roles
    const usuariosFormateados = await Promise.all(
      usuarios.map((usuario) => this.formatUserWithRoles(usuario, lang))
    );

    const paginatedResponse = PaginationHelper.createPaginatedResponse(
      usuariosFormateados,
      total,
      page,
      limit,
    );

    return await this.responseHelper.successResponse(paginatedResponse, MessageCode.SUCCESS, lang);
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: string, lang: string = 'es') {
    const usuario = await this.usuarioRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.USER_NOT_FOUND,
          lang,
          { error: 'USER_NOT_FOUND', userId: id, message: 'User not found in database' },
          404,
        ),
      );
    }

    // Formatear usuario con roles
    const usuarioFormateado = await this.formatUserWithRoles(usuario, lang);

    return await this.responseHelper.successResponse(
      usuarioFormateado,
      MessageCode.SUCCESS,
      lang,
    );
  }

  /**
   * Crear un nuevo usuario (con soporte para rol y sucursales)
   */
  async create(createUsuarioDto: CreateUsuarioDto, lang: string = 'es') {
    // Verificar que el email no exista
    const existingUser = await this.usuarioRepository.findByEmail(createUsuarioDto.email);
    if (existingUser) {
      throw new ConflictException(
        await this.responseHelper.errorResponse(
          MessageCode.EMAIL_EXISTS,
          lang,
          { error: 'EMAIL_EXISTS', email: createUsuarioDto.email, message: 'Email already exists' },
          409,
        ),
      );
    }

    // Extraer roleId y branchIds del DTO
    const { roleId, branchIds, ...usuarioData } = createUsuarioDto;

    // Validar rol si se proporciona
    if (roleId) {
      const roleResponse = await this.roleService.findOne(roleId, lang);
      if (!roleResponse.data) {
        throw new BadRequestException(
          await this.responseHelper.errorResponse(
            MessageCode.ROLE_NOT_FOUND,
            lang,
            { error: 'ROLE_NOT_FOUND', roleId },
            404,
          ),
        );
      }
    }

    // Validar sucursales si se proporcionan
    if (branchIds && branchIds.length > 0) {
      for (const branchId of branchIds) {
        const branch = await this.branchRepository.findOne(branchId);
        if (!branch) {
          throw new BadRequestException(
            await this.responseHelper.errorResponse(
              MessageCode.BRANCH_NOT_FOUND,
              lang,
              { error: 'BRANCH_NOT_FOUND', branchId },
              404,
            ),
          );
        }
        // Verificar que la sucursal pertenece a la empresa del usuario
        if (branch.companyId !== createUsuarioDto.companyId) {
          throw new BadRequestException(
            await this.responseHelper.errorResponse(
              MessageCode.BUSINESS_RULE_VIOLATION,
              lang,
              { error: 'BRANCH_NOT_IN_COMPANY', branchId, companyId: createUsuarioDto.companyId },
              400,
            ),
          );
        }
      }
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(usuarioData.password, 10);

    // Crear el usuario con datos básicos
    const usuario = this.usuarioRepository.create({
      ...usuarioData,
      password: hashedPassword,
      status: usuarioData.status !== undefined ? usuarioData.status : RecordStatus.ACTIVE,
    });

    const savedUsuario = await this.usuarioRepository.save(usuario);

    // Asignar rol si se proporciona
    if (roleId) {
      await this.userRoleRepository.create({
        userId: savedUsuario.id,
        roleId: roleId,
        branchId: null,
        status: RecordStatus.ACTIVE,
      });
    }

    // Asignar sucursales si se proporcionan
    if (branchIds && branchIds.length > 0) {
      const branches = await Promise.all(
        branchIds.map(id => this.branchRepository.findOne(id))
      );
      savedUsuario.availableBranches = branches.map(b => ({
        id: b.id,
        code: b.code,
        name: b.name,
      }));
      savedUsuario.currentBranchId = branchIds[0];
      await this.usuarioRepository.save(savedUsuario);
    }

    // Obtener el usuario con roles para retornar
    const usuarioConRoles = await this.usuarioRepository.findOne(savedUsuario.id);
    const usuarioFormateado = await this.formatUserWithRoles(usuarioConRoles, lang);

    return await this.responseHelper.successResponse(
      usuarioFormateado,
      MessageCode.USER_CREATED,
      lang,
      201,
    );
  }

  /**
   * Actualizar un usuario
   */
  async update(id: string, updateUsuarioDto: UpdateUsuarioDto, lang: string = 'es') {
    const usuario = await this.usuarioRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.USER_NOT_FOUND,
          lang,
          { error: 'USER_NOT_FOUND', userId: id, message: 'User not found in database' },
          404,
        ),
      );
    }

    // Si se actualiza el email, verificar que no exista
    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const existingUser = await this.usuarioRepository.findByEmail(updateUsuarioDto.email);
      if (existingUser) {
        throw new ConflictException(
          await this.responseHelper.errorResponse(
            MessageCode.EMAIL_EXISTS,
            lang,
            {
              error: 'EMAIL_EXISTS',
              email: updateUsuarioDto.email,
              message: 'Email already exists',
            },
            409,
          ),
        );
      }
    }

    // Si se actualiza la contraseña, hashearla
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    // Actualizar el usuario
    Object.assign(usuario, updateUsuarioDto);
    const updatedUsuario = await this.usuarioRepository.save(usuario);

    // Retornar sin la contraseña
    const { password, ...userWithoutPassword } = updatedUsuario;

    return await this.responseHelper.successResponse(
      userWithoutPassword,
      MessageCode.PROFILE_UPDATED,
      lang,
    );
  }

  /**
   * Eliminar (soft delete) un usuario
   */
  async remove(id: string, lang: string = 'es') {
    const usuario = await this.usuarioRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.USER_NOT_FOUND,
          lang,
          { error: 'USER_NOT_FOUND', userId: id, message: 'User not found in database' },
          404,
        ),
      );
    }

    // Soft delete: marcar como eliminado
    usuario.status = RecordStatus.DELETED;
    await this.usuarioRepository.save(usuario);

    return await this.responseHelper.successResponse(
      { id, message: 'Usuario eliminado exitosamente' },
      MessageCode.SUCCESS,
      lang,
    );
  }

  // ============================================
  // MÉTODOS PARA ACTUALIZACIÓN COMPLETA
  // ============================================

  /**
   * Actualizar usuario de forma completa
   * Incluye datos básicos + roles + sucursales
   */
  async updateCompleto(id: string, updateDto: UpdateUsuarioCompletoDto, lang: string = 'es') {
    // Cargar usuario SIN relaciones para evitar problemas con cascade al guardar
    const usuario = await this.usuarioRepository.findOneBasic(id);
    if (!usuario) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.USER_NOT_FOUND,
          lang,
          { error: 'USER_NOT_FOUND', userId: id, message: 'User not found in database' },
          404,
        ),
      );
    }

    // 1. Actualizar datos básicos del usuario
    if (updateDto.email && updateDto.email !== usuario.email) {
      const existingUser = await this.usuarioRepository.findByEmail(updateDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          await this.responseHelper.errorResponse(
            MessageCode.EMAIL_EXISTS,
            lang,
            { error: 'EMAIL_EXISTS', email: updateDto.email, message: 'Email already exists' },
            409,
          ),
        );
      }
      usuario.email = updateDto.email;
    }

    if (updateDto.password) {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(updateDto.password, salt);
    }

    if (updateDto.firstName) usuario.firstName = updateDto.firstName;
    if (updateDto.lastName) usuario.lastName = updateDto.lastName;
    if (updateDto.phone !== undefined) usuario.phone = updateDto.phone;
    if (updateDto.companyId) usuario.companyId = updateDto.companyId;
    if (updateDto.status !== undefined) usuario.status = updateDto.status;

    // 2. Gestionar rol (si se proporciona)
    if (updateDto.roleId) {
      // Verificar que el rol exista
      const roleResponse = await this.roleService.findOne(updateDto.roleId, lang);
      if (!roleResponse.data) {
        throw new BadRequestException(
          await this.responseHelper.errorResponse(
            MessageCode.ROLE_NOT_FOUND,
            lang,
            { error: 'ROLE_NOT_FOUND', roleId: updateDto.roleId },
            404,
          ),
        );
      }

      try {
        // Eliminar roles actuales del usuario
        await this.userRoleRepository.deleteByUserId(id);

        // Pequeña espera para asegurar que el delete se complete
        await new Promise(resolve => setTimeout(resolve, 50));

        // Asignar el nuevo rol con todos los campos necesarios
        await this.userRoleRepository.create({
          userId: id,
          roleId: updateDto.roleId,
          branchId: null,
          status: RecordStatus.ACTIVE,
        });
      } catch (error) {
        throw new BadRequestException(
          await this.responseHelper.errorResponse(
            MessageCode.BUSINESS_RULE_VIOLATION,
            lang,
            { 
              error: 'ROLE_UPDATE_FAILED', 
              message: 'Error al actualizar el rol del usuario',
              details: error.message 
            },
            400,
          ),
        );
      }
    }

    // 3. Gestionar sucursales (si se proporcionan)
    if (updateDto.branchIds && Array.isArray(updateDto.branchIds)) {
      // Validar que todas las sucursales existan y pertenezcan a la empresa del usuario
      const validBranches = [];
      for (const branchId of updateDto.branchIds) {
        const branch = await this.branchRepository.findOne(branchId);
        if (!branch) {
          throw new BadRequestException(
            await this.responseHelper.errorResponse(
              MessageCode.BRANCH_NOT_FOUND,
              lang,
              { error: 'BRANCH_NOT_FOUND', branchId },
              404,
            ),
          );
        }
        if (branch.companyId !== usuario.companyId) {
          throw new BadRequestException(
            await this.responseHelper.errorResponse(
              MessageCode.BUSINESS_RULE_VIOLATION,
              lang,
              { error: 'BRANCH_COMPANY_MISMATCH', branchId, message: 'Branch does not belong to user company' },
              400,
            ),
          );
        }
        validBranches.push({
          id: branch.id,
          code: branch.code,
          name: branch.name,
        });
      }

      // Actualizar sucursales disponibles
      usuario.availableBranches = validBranches;

      // Si no tiene sucursal actual o la actual no está en la nueva lista, asignar la primera
      if (!updateDto.branchIds.includes(usuario.currentBranchId) && validBranches.length > 0) {
        usuario.currentBranchId = validBranches[0].id;
      }
    }

    // 4. Guardar usuario actualizado
    await this.usuarioRepository.save(usuario);

    // 5. Recargar el usuario con todas las relaciones de forma explícita
    try {
      // Esperar un momento para que SQLite sincronice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Obtener el usuario recargado con relaciones
      const usuarioConRoles = await this.usuarioRepository.findOne(id);
      
      if (!usuarioConRoles) {
        throw new NotFoundException(
          await this.responseHelper.errorResponse(
            MessageCode.USER_NOT_FOUND,
            lang,
            { error: 'USER_NOT_FOUND', userId: id },
            404,
          ),
        );
      }

      const usuarioFormateado = await this.formatUserWithRoles(usuarioConRoles, lang);

      return await this.responseHelper.successResponse(
        usuarioFormateado,
        MessageCode.RESOURCE_UPDATED,
        lang,
      );
    } catch (error) {
      // Si falla al cargar con relaciones, retornar sin roles
      const { password, userRoles, ...userWithoutPassword } = usuario;
      
      return await this.responseHelper.successResponse(
        {
          ...userWithoutPassword,
          roles: [], // Array vacío como fallback
        },
        MessageCode.RESOURCE_UPDATED,
        lang,
      );
    }
  }

  // ============================================
  // MÉTODOS PARA CONSULTAR ROLES Y SUCURSALES
  // ============================================

  /**
   * Obtener roles de un usuario
   */
  async getUserRoles(userId: string, lang: string = 'es') {
    // Verificar que el usuario exista
    const usuario = await this.usuarioRepository.findOne(userId);
    if (!usuario) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.USER_NOT_FOUND,
          lang,
          { error: 'USER_NOT_FOUND', userId, message: 'User not found in database' },
          404,
        ),
      );
    }

    // Obtener roles del usuario
    const userRoles = await this.userRoleRepository.findByUserId(userId);

    const roles = userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      displayName: ur.role.displayName,
      description: ur.role.description,
      status: ur.status,
      assignedAt: ur.createdAt,
    }));

    return await this.responseHelper.successResponse(
      roles,
      MessageCode.SUCCESS,
      lang,
    );
  }

  /**
   * Obtener sucursales de un usuario
   */
  async getUserBranches(userId: string, lang: string = 'es') {
    // Verificar que el usuario exista
    const usuario = await this.usuarioRepository.findOne(userId);
    if (!usuario) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.USER_NOT_FOUND,
          lang,
          { error: 'USER_NOT_FOUND', userId, message: 'User not found in database' },
          404,
        ),
      );
    }

    // Obtener sucursales disponibles del usuario
    const branches = usuario.availableBranches || [];

    return await this.responseHelper.successResponse(
      {
        currentBranchId: usuario.currentBranchId,
        availableBranches: branches,
      },
      MessageCode.SUCCESS,
      lang,
    );
  }
}
