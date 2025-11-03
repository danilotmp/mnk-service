import { Injectable, NotFoundException } from '@nestjs/common';
import { MenuItemRepository } from '../../infrastructure/repositories/menu-item.repository';
import { RoleRepository } from '../../infrastructure/repositories/role.repository';
import { AuthorizationService } from './authorization.service';
import { ResponseHelper } from '@/common/messages/response.helper';
import { MessageCode } from '@/common/messages/message-codes';

/**
 * Interface para el menú del frontend
 */
export interface MenuItem {
  id: string;
  label: string;
  route?: string;
  columns?: Array<{
    title: string;
    items: Array<{
      id: string;
      label: string;
      route: string;
    }>;
  }>;
  submenu?: Array<{
    id: string;
    label: string;
    route: string;
    description?: string;
  }>;
}

/**
 * Servicio de Menú
 * Genera el menú según los permisos del rol
 */
@Injectable()
export class MenuService {
  constructor(
    private menuItemRepository: MenuItemRepository,
    private roleRepository: RoleRepository,
    private authorizationService: AuthorizationService,
    private responseHelper: ResponseHelper,
  ) {}

  /**
   * Obtiene el menú privado según los permisos del usuario autenticado
   * 
   * Lógica:
   * - Solo devuelve items privados (isPublic = false)
   * - Filtra según permisos del usuario (obtenidos de sus roles)
   * - Si el usuario no tiene permisos asignados, devuelve alerta
   * 
   * @param userId ID del usuario autenticado
   * @param lang Idioma para los mensajes
   * @returns Array de items privados del menú filtrados según permisos del usuario
   */
  async getMenuByUser(userId: string, lang: string = 'es'): Promise<MenuItem[]> {
    // 1. Obtener permisos del usuario (combinando permisos de todos sus roles activos)
    const userPermissions = await this.authorizationService.getUserPermissions(userId);
    const userPermissionCodes = userPermissions.map((p) => p.code);

    // 2. Validar que el usuario tenga permisos asignados
    if (userPermissionCodes.length === 0) {
      // Retornar objeto especial con alerta para que el controller lo maneje
      return {
        menu: [],
        alert: {
          userId,
          message: 'El usuario no tiene permisos asignados. Debe configurar roles y permisos en el sistema de administración.',
        },
      } as any;
    }

    // 3. Obtener TODOS los items del menú (solo privados)
    const allMenuItems = await this.menuItemRepository.findAll();

    // 4. Filtrar solo items privados según permisos del usuario
    const filteredMenu: MenuItem[] = [];

    for (const item of allMenuItems) {
      // Solo procesar items privados (no públicos)
      if (item.isPublic) {
        continue; // Omitir items públicos, el frontend los maneja
      }

      // Si no requiere permiso específico, incluirlo (acceso general para usuarios autenticados)
      if (!item.permission) {
        filteredMenu.push(await this.mapMenuItem(item, userPermissionCodes));
        continue;
      }

      // Si requiere permiso, verificar que el usuario lo tenga
      if (userPermissionCodes.includes(item.permission.code)) {
        filteredMenu.push(await this.mapMenuItem(item, userPermissionCodes));
      }
      // Si no tiene permiso, no incluir
    }

    return filteredMenu;
  }

  /**
   * Obtiene el menú privado según los permisos del rol
   * 
   * @deprecated Usar getMenuByUser en su lugar. Este método se mantiene por compatibilidad.
   */
  async getMenuByRole(roleId: string, lang: string = 'es'): Promise<MenuItem[]> {
    // 1. Verificar que el rol existe
    const role = await this.roleRepository.findOne(roleId);
    if (!role || !role.isActive) {
      throw new NotFoundException(
        await this.responseHelper.errorResponse(
          MessageCode.ROLE_NOT_FOUND,
          lang,
          { roleId, message: 'Rol no encontrado o inactivo' },
          404,
        ),
      );
    }

    // 2. Obtener permisos del rol
    const rolePermissions = await this.authorizationService.getRolePermissions(roleId);
    const rolePermissionCodes = rolePermissions.map((p) => p.code);

    // 3. Validar que el rol tenga permisos asignados
    if (rolePermissionCodes.length === 0) {
      // Retornar objeto especial con alerta para que el controller lo maneje
      return {
        menu: [],
        alert: {
          roleId,
          roleName: role.name,
          message: 'El rol no tiene permisos asignados. Debe configurar permisos en el sistema de administración.',
        },
      } as any;
    }

    // 4. Obtener TODOS los items del menú (solo privados)
    const allMenuItems = await this.menuItemRepository.findAll();

    // 5. Filtrar solo items privados según permisos del rol
    const filteredMenu: MenuItem[] = [];

    for (const item of allMenuItems) {
      // Solo procesar items privados (no públicos)
      if (item.isPublic) {
        continue; // Omitir items públicos, el frontend los maneja
      }

      // Si no requiere permiso específico, incluirlo (acceso general para usuarios autenticados)
      if (!item.permission) {
        filteredMenu.push(await this.mapMenuItem(item, rolePermissionCodes));
        continue;
      }

      // Si requiere permiso, verificar que el rol lo tenga
      if (rolePermissionCodes.includes(item.permission.code)) {
        filteredMenu.push(await this.mapMenuItem(item, rolePermissionCodes));
      }
      // Si no tiene permiso, no incluir
    }

    return filteredMenu;
  }

  /**
   * Obtiene el menú completo para un usuario (método legacy - mantener por compatibilidad)
   * 
   * @deprecated Usar getMenuByRole en su lugar
   */
  async getMenu(userId: string | null): Promise<MenuItem[]> {
    // Obtener permisos del usuario si está autenticado
    let userPermissions: string[] = [];
    if (userId) {
      const permissions = await this.authorizationService.getUserPermissions(userId);
      userPermissions = permissions.map((p) => p.code);
    }

    // Obtener TODOS los items del menú (públicos y privados)
    const allMenuItems = await this.menuItemRepository.findAll();

    // Filtrar items según permisos
    const filteredMenu: MenuItem[] = [];

    for (const item of allMenuItems) {
      // Si es público, siempre incluirlo
      if (item.isPublic) {
        filteredMenu.push(await this.mapMenuItem(item, userPermissions));
        continue;
      }

      // Si no es público pero no requiere permiso específico, incluirlo si está autenticado
      if (!item.permission) {
        if (userId) {
          filteredMenu.push(await this.mapMenuItem(item, userPermissions));
        }
        continue;
      }

      // Si requiere permiso, verificar que el usuario lo tenga
      if (userId && userPermissions.includes(item.permission.code)) {
        filteredMenu.push(await this.mapMenuItem(item, userPermissions));
      }
    }

    return filteredMenu;
  }

  /**
   * Mapea un MenuItemEntity a MenuItem
   */
  private async mapMenuItem(item: any, userPermissions: string[]): Promise<MenuItem> {
    const menuItem: MenuItem = {
      id: item.menuId,
      label: item.label,
    };

    if (item.route) {
      menuItem.route = item.route;
    }

    // Procesar columns (menús multi-columna)
    if (item.columns && Array.isArray(item.columns)) {
      menuItem.columns = item.columns
        .map((col: any) => {
          const filteredItems = col.items?.filter((subItem: any) => {
            // Si el subitem no requiere permiso o el usuario lo tiene
            return !subItem.permission || userPermissions.includes(subItem.permission.code);
          });

          if (filteredItems && filteredItems.length > 0) {
            return {
              title: col.title,
              items: filteredItems.map((subItem: any) => ({
                id: subItem.id || subItem.menuId,
                label: subItem.label,
                route: subItem.route,
              })),
            };
          }
          return null;
        })
        .filter((col: any) => col !== null);
    }

    // Procesar submenu (submenús simples)
    if (item.submenu && Array.isArray(item.submenu)) {
      menuItem.submenu = item.submenu
        .filter((subItem: any) => {
          // Si el subitem no requiere permiso o el usuario lo tiene
          return !subItem.permission || userPermissions.includes(subItem.permission.code);
        })
        .map((subItem: any) => ({
          id: subItem.id || subItem.menuId,
          label: subItem.label,
          route: subItem.route,
          description: subItem.description,
        }));
    }

    // Procesar children (submenús jerárquicos)
    if (item.children && Array.isArray(item.children)) {
      const children = await Promise.all(
        item.children.map((child: any) => this.mapMenuItem(child, userPermissions)),
      );
      if (children.length > 0) {
        menuItem.submenu = children.map((child) => ({
          id: child.id,
          label: child.label,
          route: child.route || '',
        }));
      }
    }

    return menuItem;
  }
}

