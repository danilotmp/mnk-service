# 🔐 Guía de Sistema de Autorización

## 📋 Descripción

Este documento explica cómo funciona el sistema de autorización implementado en el backend, incluyendo roles, permisos y el menú dinámico.

## 🎯 Objetivo

Implementar un sistema de autorización robusto que permita:
- Controlar acceso a páginas (rutas del frontend)
- Controlar acciones dentro de las páginas (crear, editar, eliminar, etc.)
- Generar menú dinámico según permisos del usuario
- Separar páginas públicas y privadas

## 📁 Estructura de Base de Datos

### Entidades

#### 1. **RoleEntity** (Roles)
```typescript
{
  id: string;
  companyId: string;
  name: string; // 'admin', 'usuario', 'editor'
  displayName: string; // 'Administrador', 'Usuario', 'Editor'
  description: string;
  isActive: boolean;
  isSystem: boolean; // No se puede eliminar
}
```

#### 2. **PermissionEntity** (Permisos)
```typescript
{
  id: string;
  code: string; // 'home', 'products', 'users.create'
  name: string;
  type: 'PAGE' | 'ACTION'; // Tipo de permiso
  resource: string; // 'home', 'products', 'users'
  action: string; // 'view', 'create', 'edit', 'delete'
  route: string; // Ruta del frontend (solo para PAGE)
  menuId: string; // ID del item del menú (solo para PAGE)
  isPublic: boolean; // Si es público (no requiere autenticación)
  isActive: boolean;
  isSystem: boolean; // No se puede eliminar
}
```

#### 3. **UserRoleEntity** (Relación Usuario-Rol)
```typescript
{
  id: string;
  userId: string;
  roleId: string;
  branchId?: string; // Rol específico para sucursal (opcional)
  isActive: boolean;
}
```

#### 4. **RolePermissionEntity** (Relación Rol-Permiso)
```typescript
{
  id: string;
  roleId: string;
  permissionId: string;
  isActive: boolean;
}
```

#### 5. **MenuItemEntity** (Items del Menú)
```typescript
{
  id: string;
  menuId: string; // 'home', 'explore', 'products'
  label: string;
  route: string;
  parentId?: string; // Menú padre
  columns?: any[]; // Menús multi-columna
  submenu?: any[]; // Submenús simples
  isPublic: boolean;
  isActive: boolean;
  order: number;
  permissionId?: string; // Permiso requerido
}
```

### Relaciones

```
Usuario → UserRole → Role → RolePermission → Permission
                 ↓
              MenuItem → Permission
```

## 🚀 Uso del Sistema

### 1. **Verificar Permisos en Servicios**

```typescript
import { AuthorizationService } from '@/domains/seguridades/application/services/authorization.service';

@Injectable()
export class MiService {
  constructor(
    private authorizationService: AuthorizationService,
  ) {}

  async miMetodo(userId: string) {
    // Verificar si tiene un permiso específico
    const canView = await this.authorizationService.hasPermission(userId, 'products.view');
    
    if (!canView) {
      throw new ForbiddenException('No tienes permiso para ver productos');
    }

    // Verificar si tiene alguno de los permisos
    const canEdit = await this.authorizationService.hasAnyPermission(userId, [
      'products.edit',
      'products.admin',
    ]);

    // Verificar si tiene todos los permisos
    const canManage = await this.authorizationService.hasAllPermissions(userId, [
      'products.create',
      'products.edit',
      'products.delete',
    ]);

    // Verificar acceso a ruta
    const canAccess = await this.authorizationService.canAccessRoute(userId, '/products');
  }
}
```

### 2. **Proteger Endpoints con Guards**

```typescript
import { Permissions } from '@/domains/seguridades/infrastructure/decorators/permissions.decorator';
import { PermissionsGuard } from '@/domains/seguridades/infrastructure/guards/permissions.guard';
import { UseGuards } from '@nestjs/common';

@Controller('api/productos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductosController {
  @Get()
  @Permissions(['products.view']) // Requiere este permiso
  async getProductos() {
    // ...
  }

  @Post()
  @Permissions(['products.create']) // Requiere este permiso
  async createProducto() {
    // ...
  }

  @Put(':id')
  @Permissions(['products.edit']) // Requiere este permiso
  async updateProducto() {
    // ...
  }

  @Delete(':id')
  @Permissions(['products.delete', 'products.admin'], true) // Requiere AMBOS permisos
  async deleteProducto() {
    // ...
  }
}
```

### 3. **Obtener Menú del Usuario**

```typescript
import { MenuService } from '@/domains/seguridades/application/services/menu.service';

@Controller('api/menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  async getMenu(@Request() req) {
    const userId = req.user?.userId || null;
    const menu = await this.menuService.getMenu(userId);
    return menu;
  }
}
```

## 📊 Tipos de Permisos

### Permisos de Página (PAGE)

Acceso a rutas/páginas del frontend:

```typescript
{
  code: 'home',
  type: 'PAGE',
  route: '/',
  menuId: 'home',
  isPublic: true,
}

{
  code: 'products',
  type: 'PAGE',
  route: '/products',
  menuId: 'products',
  isPublic: false,
}
```

### Permisos de Acción (ACTION)

Acciones dentro de las páginas:

```typescript
{
  code: 'users.create',
  type: 'ACTION',
  resource: 'users',
  action: 'create',
  isPublic: false,
}

{
  code: 'users.edit',
  type: 'ACTION',
  resource: 'users',
  action: 'edit',
  isPublic: false,
}

{
  code: 'users.delete',
  type: 'ACTION',
  resource: 'users',
  action: 'delete',
  isPublic: false,
}
```

## 🎨 Estructura del Menú

El menú se genera dinámicamente según los permisos del usuario:

```typescript
interface MenuItem {
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
```

### Ejemplo de Menú Generado

**Usuario sin autenticar (solo público):**
```json
[
  {
    "id": "home",
    "label": "Inicio",
    "route": "/"
  },
  {
    "id": "contact",
    "label": "Contacto",
    "route": "/contact"
  }
]
```

**Usuario autenticado con permisos:**
```json
[
  {
    "id": "home",
    "label": "Inicio",
    "route": "/"
  },
  {
    "id": "explore",
    "label": "Explorar",
    "route": "/main/explore"
  },
  {
    "id": "products",
    "label": "Productos",
    "columns": [
      {
        "title": "Productos",
        "items": [
          { "id": "network-security", "label": "Network Security", "route": "/products/network-security" }
        ]
      }
    ]
  }
]
```

## 🔧 Endpoints Disponibles

### Menú

```
GET /api/menu
- Obtiene el menú del sistema según estado de autenticación
- Token opcional (no requiere autenticación obligatoria)
- Con token válido: devuelve menú completo según permisos del rol del usuario (items públicos + privados según permisos)
- Sin token o token inválido: devuelve solo items públicos
- Si se envía token, se obtiene el userId del token y se usan los permisos del rol del usuario
- Si no se envía token o es inválido, se trata como no autenticado
```

### Verificar Permisos (Futuro)

```
GET /api/permissions/check
- Verifica si un usuario tiene un permiso específico
- Requiere autenticación
```

## 📝 Flujo de Autorización

```
1. Usuario hace login
   ↓
2. Se obtiene JWT token con userId
   ↓
3. Usuario hace petición al backend
   ↓
4. JwtAuthGuard verifica token
   ↓
5. PermissionsGuard verifica permisos (si aplica)
   ↓
6. Si tiene permisos → Accede al endpoint
   ↓
7. Si no tiene permisos → Error 403 Forbidden
```

## 🎯 Mejores Prácticas

### 1. **Nomenclatura de Permisos**

- **Páginas**: `resource` (ej: `home`, `products`, `users`)
- **Acciones**: `resource.action` (ej: `users.create`, `users.edit`, `users.delete`)

### 2. **Roles del Sistema**

- `admin`: Acceso completo
- `usuario`: Acceso básico
- `editor`: Puede crear/editar
- `viewer`: Solo lectura

### 3. **Permisos Públicos**

- Usar `isPublic: true` para páginas que no requieren autenticación
- Ejemplo: `home`, `contact`, `about`

### 4. **Permisos del Sistema**

- Usar `isSystem: true` para roles/permisos base que no se pueden eliminar
- Ejemplo: `admin`, `home`, `login`

## 📋 Resumen

### Características

✅ Control de acceso a páginas  
✅ Control de acciones dentro de páginas  
✅ Menú dinámico según permisos  
✅ Separación de páginas públicas y privadas  
✅ Roles y permisos flexibles  
✅ Multiempresa compatible  

### Estructura

- **Entidades**: Role, Permission, UserRole, RolePermission, MenuItem
- **Repositorios**: RoleRepository, PermissionRepository, MenuItemRepository
- **Servicios**: AuthorizationService, MenuService
- **Guards**: PermissionsGuard
- **Decoradores**: @Permissions()

---

**¡Sistema de Autorización listo para usar! 🎉**

