import { SetMetadata } from '@nestjs/common';

/**
 * Clave para los metadatos de permisos
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorador para definir los permisos requeridos en un endpoint
 * 
 * @param permissions Array de códigos de permisos requeridos
 * @param requireAll Si es true, requiere TODOS los permisos. Si es false, requiere CUALQUIERA
 * 
 * @example
 * @Permissions(['users.view'])
 * @Permissions(['users.create', 'users.edit'], true) // Requiere ambos
 */
export const Permissions = (permissions: string[], requireAll: boolean = false) =>
  SetMetadata(PERMISSIONS_KEY, { permissions, requireAll });

