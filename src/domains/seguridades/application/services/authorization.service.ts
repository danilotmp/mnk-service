import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from '../../infrastructure/entities/usuario.entity';
import { PermissionEntity, PermissionType } from '../../infrastructure/entities/permission.entity';
import { PermissionRepository } from '../../infrastructure/repositories/permission.repository';
import { RoleEntity } from '../../infrastructure/entities/role.entity';

/**
 * Servicio de Autorización
 * Maneja la verificación de permisos de usuarios
 */
@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private permissionRepository: PermissionRepository,
  ) {}

  /**
   * Obtiene todos los permisos de un usuario (a través de sus roles)
   */
  async getUserPermissions(userId: string): Promise<PermissionEntity[]> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId, isActive: true },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });

    if (!usuario) {
      return [];
    }

    // Obtener todos los permisos únicos del usuario
    const permissionsSet = new Set<string>();
    const permissions: PermissionEntity[] = [];

    usuario.userRoles.forEach((userRole) => {
      if (userRole.isActive && userRole.role.isActive) {
        userRole.role.rolePermissions.forEach((rolePermission) => {
          if (
            rolePermission.isActive &&
            rolePermission.permission.isActive &&
            !permissionsSet.has(rolePermission.permission.id)
          ) {
            permissionsSet.add(rolePermission.permission.id);
            permissions.push(rolePermission.permission);
          }
        });
      }
    });

    return permissions;
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some((p) => p.code === permissionCode && p.isActive);
  }

  /**
   * Verifica si un usuario tiene alguno de los permisos especificados
   */
  async hasAnyPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    const userPermissionCodes = permissions.map((p) => p.code);
    return permissionCodes.some((code) => userPermissionCodes.includes(code));
  }

  /**
   * Verifica si un usuario tiene todos los permisos especificados
   */
  async hasAllPermissions(userId: string, permissionCodes: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    const userPermissionCodes = permissions.map((p) => p.code);
    return permissionCodes.every((code) => userPermissionCodes.includes(code));
  }

  /**
   * Verifica si un usuario puede acceder a una ruta específica
   */
  async canAccessRoute(userId: string | null, route: string): Promise<boolean> {
    // Buscar permiso por ruta
    const permission = await this.permissionRepository.findByRoute(route);

    if (!permission || !permission.isActive) {
      return false;
    }

    // Si es público, permitir acceso
    if (permission.isPublic) {
      return true;
    }

    // Si no hay usuario y no es público, denegar acceso
    if (!userId) {
      return false;
    }

    // Si hay usuario, verificar si tiene permiso
    return this.hasPermission(userId, permission.code);
  }

  /**
   * Verifica si un usuario puede ejecutar una acción específica
   */
  async canExecuteAction(userId: string, resource: string, action: string): Promise<boolean> {
    const permissionCode = `${resource}.${action}`;
    return this.hasPermission(userId, permissionCode);
  }

  /**
   * Obtiene todos los permisos de un rol específico
   */
  async getRolePermissions(roleId: string): Promise<PermissionEntity[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, isActive: true },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role || !role.isActive) {
      return [];
    }

    const permissions: PermissionEntity[] = [];
    const permissionsSet = new Set<string>();

    if (role.rolePermissions) {
      role.rolePermissions.forEach((rolePermission: any) => {
        if (
          rolePermission.isActive &&
          rolePermission.permission &&
          rolePermission.permission.isActive &&
          !permissionsSet.has(rolePermission.permission.id)
        ) {
          permissionsSet.add(rolePermission.permission.id);
          permissions.push(rolePermission.permission);
        }
      });
    }

    return permissions;
  }
}

